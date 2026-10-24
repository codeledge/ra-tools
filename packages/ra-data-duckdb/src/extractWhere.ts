import { isArray, isObject, isString, PlainObject } from "deverything";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import { quoteIdent } from "./lib/quoteIdent";
import { SqlParams } from "./lib/SqlParams";

export type FilterMode = "insensitive" | "default" | undefined;

export type ExtractWhereOptions = {
  filterMode?: FilterMode;
  debug?: boolean;
  /** Columns used when filter key `q` is present (OR of LIKE / ILIKE). */
  searchColumns?: string[];
  primaryKey?: string;
};

const SUFFIX_OPS: Record<string, string> = {
  _eq: "=",
  _exact: "=",
  _enum: "=",
  _gt: ">",
  _gte: ">=",
  _lt: "<",
  _lte: "<=",
  _ne: "!=",
  _not: "!=",
};

export type WhereClause = {
  sql: string;
  params: Record<string, unknown>;
};

const buildClauses = (
  filterObj: PlainObject,
  params: SqlParams,
  options: ExtractWhereOptions | undefined,
  primaryKey: string,
  caseInsensitive: boolean,
): string[] => {
  const clauses: string[] = [];

  const pushCompare = (column: string, op: string, value: unknown) => {
    const col = quoteIdent(column === "id" ? primaryKey : column);
    if (value === null) {
      clauses.push(op === "!=" ? `${col} IS NOT NULL` : `${col} IS NULL`);
      return;
    }
    clauses.push(`${col} ${op} ${params.add(value)}`);
  };

  const pushLike = (column: string, pattern: string) => {
    const col = quoteIdent(column === "id" ? primaryKey : column);
    const placeholder = params.add(pattern);
    clauses.push(
      caseInsensitive
        ? `LOWER(CAST(${col} AS VARCHAR)) LIKE LOWER(${placeholder})`
        : `CAST(${col} AS VARCHAR) LIKE ${placeholder}`,
    );
  };

  Object.entries(filterObj).forEach(([field, value]) => {
    if (isNotField(field)) return;
    if (value === "") return;

    if (field === "q") {
      if (isString(value) && options?.searchColumns?.length && value.length > 0) {
        const ors = options.searchColumns.map((col) => {
          const placeholder = params.add(`%${value}%`);
          const quoted = quoteIdent(col);
          return caseInsensitive
            ? `LOWER(CAST(${quoted} AS VARCHAR)) LIKE LOWER(${placeholder})`
            : `CAST(${quoted} AS VARCHAR) LIKE ${placeholder}`;
        });
        clauses.push(`(${ors.join(" OR ")})`);
      }
      return;
    }

    if (["OR", "AND", "NOT"].includes(field)) {
      if (isArray(value) && value.every((item) => isObject(item))) {
        const group: string[] = [];
        for (const item of value as PlainObject[]) {
          const nested = buildClauses(
            item,
            params,
            options,
            primaryKey,
            caseInsensitive,
          );
          if (nested.length) {
            group.push(`(${nested.join(" AND ")})`);
          }
        }
        if (group.length) {
          if (field === "NOT") {
            clauses.push(`NOT (${group.join(" AND ")})`);
          } else {
            clauses.push(`(${group.join(` ${field} `)})`);
          }
        }
      }
      return;
    }

    const suffix = Object.keys(SUFFIX_OPS).find((s) => field.endsWith(s));
    if (suffix) {
      pushCompare(field.slice(0, -suffix.length), SUFFIX_OPS[suffix], value);
      return;
    }

    if (field.endsWith("_contains")) {
      pushLike(field.slice(0, -"_contains".length), `%${value}%`);
      return;
    }
    if (field.endsWith("_startsWith")) {
      pushLike(field.slice(0, -"_startsWith".length), `${value}%`);
      return;
    }
    if (field.endsWith("_endsWith")) {
      pushLike(field.slice(0, -"_endsWith".length), `%${value}`);
      return;
    }
    if (field.endsWith("_trueOnly")) {
      if (value === true) {
        pushCompare(field.slice(0, -"_trueOnly".length), "=", true);
      }
      return;
    }
    if (field.endsWith("_in") && isArray(value)) {
      const column = field.slice(0, -"_in".length);
      const col = quoteIdent(column === "id" ? primaryKey : column);
      if (value.length === 0) {
        clauses.push("FALSE");
        return;
      }
      const placeholders = value.map((v) => params.add(v));
      clauses.push(`${col} IN (${placeholders.join(", ")})`);
      return;
    }

    // Array values always become IN (...), including id-like fields such as
    // `id`, `author_id`, or `userId` (ReferenceArrayInput / multi-select FKs).
    if (isArray(value)) {
      const col = quoteIdent(field === "id" ? primaryKey : field);
      if (value.length === 0) {
        clauses.push("FALSE");
        return;
      }
      const placeholders = value.map((v) => params.add(v));
      clauses.push(`${col} IN (${placeholders.join(", ")})`);
      return;
    }

    if (
      field === "id" ||
      field === "uuid" ||
      field === "uid" ||
      field === "cuid" ||
      field.endsWith("_id") ||
      field.endsWith("_uuid") ||
      field.endsWith("_uid") ||
      field.endsWith("_cuid") ||
      field.endsWith("Id") ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      pushCompare(field, "=", value);
    } else if (isString(value)) {
      pushLike(field, `%${value}%`);
    } else if (isObject(value)) {
      throw new Error(
        `ra-data-duckdb: Nested filter "${field}" is not supported; use a flat column filter`,
      );
    } else {
      console.info("ra-data-duckdb: Filter not handled", field, value);
    }
  });

  return clauses;
};

export const extractWhere = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractWhereOptions,
): WhereClause => {
  const { filter } = req.params;
  const params = new SqlParams();
  const primaryKey = options?.primaryKey ?? "id";
  const caseInsensitive = options?.filterMode !== "default";

  const clauses = filter
    ? buildClauses(filter, params, options, primaryKey, caseInsensitive)
    : [];

  const sql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  if (options?.debug) console.debug("extractWhere", sql, params.get());

  return { sql, params: params.get() };
};

/** Append an AND condition onto an existing WHERE clause. */
export const andWhere = (
  where: WhereClause,
  extraSql: string,
  extraParams?: Record<string, unknown>,
): WhereClause => {
  const params = { ...where.params, ...extraParams };
  if (!extraSql) return { sql: where.sql, params };
  if (!where.sql) return { sql: `WHERE ${extraSql}`, params };
  return { sql: `${where.sql} AND ${extraSql}`, params };
};
