import {
  type PlainObject,
  isArray,
  isObject,
  isString,
  setObjectPath,
} from "deverything";
import { sql } from "drizzle-orm";
import type { DrizzleWhere } from "./DrizzleTypes";
import type { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import { RDDError } from "./RDDError";

export const OPERATOR_SEPARATOR = "@";

/** Drizzle RQB v2 operators, passed through verbatim from `field@operator` */
export const drizzleOperators = [
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "notIn",
  "like",
  "ilike",
  "notLike",
  "notIlike",
  "isNull",
  "isNotNull",
  "arrayContains",
  "arrayOverlaps",
  "arrayContained",
] as const;

/** Convenience aliases for react-admin inputs, which send raw values */
export const aliasOperators = [
  "contains",
  "startsWith",
  "endsWith",
  "exact",
  "pgjson",
  "search",
] as const;

export type DrizzleOperator = (typeof drizzleOperators)[number];
export type AliasOperator = (typeof aliasOperators)[number];

/**
 * - `undefined` / `"insensitive"`: string filters use `ilike`
 * - `"default"`: string filters use `like` (case sensitive)
 */
export type FilterMode = "insensitive" | "default" | undefined;

export type ExtractWhereOptions = {
  filterMode?: FilterMode;
  debug?: boolean;
};

const arrayOperators = new Set<string>([
  "in",
  "notIn",
  "arrayContains",
  "arrayOverlaps",
  "arrayContained",
]);

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const isIdLikeField = (field: string) =>
  field === "id" ||
  field === "uuid" ||
  field === "uid" ||
  field === "cuid" ||
  field.endsWith("_id") ||
  field.endsWith("_uuid") ||
  field.endsWith("_uid") ||
  field.endsWith("_cuid") ||
  field.endsWith("Id");

const splitOperator = (field: string) => {
  const index = field.lastIndexOf(OPERATOR_SEPARATOR);
  if (index === -1) return { column: field, operator: undefined };
  return {
    column: field.slice(0, index),
    operator: field.slice(index + 1),
  };
};

const joinPath = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(".");

/**
 * Converts a react-admin filter into a Drizzle relational query (RQB v2) `where` object.
 *
 * - `field@op` where `op` is any Drizzle RQB operator: `title@ilike`, `age@gte`, `status@notIn`...
 * - aliases: `@contains`, `@startsWith`, `@endsWith`, `@exact`, `@pgjson`, `@search`
 * - bare fields: string => ilike %v%, number/boolean/id-like => eq, null => isNull, array => in,
 *   nested object => relation filter
 */
export const extractWhere = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractWhereOptions,
): DrizzleWhere => {
  const where = filterToWhere(req.params.filter, options);

  if (options?.debug) console.debug("extractWhere:where", where);

  return where;
};

export const filterToWhere = (
  filter: PlainObject | undefined | null,
  options?: ExtractWhereOptions,
): DrizzleWhere => {
  const where: DrizzleWhere = {};
  // Raw conditions (@pgjson, @search) live at the same filter level where the
  // key appeared, so they can be ORed, negated, or used inside relation filters
  const raws: PlainObject[] = [];
  const likeOperator = options?.filterMode === "default" ? "like" : "ilike";

  const setCondition = (path: string, operator: string, value: any) => {
    setObjectPath(where, `${path}.${operator}`, value);
  };

  const pushRaw = (columnPath: string, build: (column: any) => any) => {
    const segments = columnPath.split(".");
    const column = segments.pop()!;
    const raw = { RAW: (table: any) => build(table[column]) };
    const parentPath = segments.join(".");
    if (parentPath) {
      // fold into the AND array at the parent level, so that many of them
      // can live side by side
      const andPath = `${parentPath}.AND`;
      const current: any[] =
        andPath.split(".").reduce<any>((node, key) => node?.[key], where) ?? [];
      setObjectPath(where, andPath, [...current, raw]);
    } else {
      raws.push(raw);
    }
  };

  const applyOperator = (path: string, operator: string, value: any) => {
    switch (operator) {
      case "contains":
        return setCondition(
          path,
          likeOperator,
          `%${escapeLike(String(value))}%`,
        );
      case "startsWith":
        return setCondition(
          path,
          likeOperator,
          `${escapeLike(String(value))}%`,
        );
      case "endsWith":
        return setCondition(
          path,
          likeOperator,
          `%${escapeLike(String(value))}`,
        );
      case "exact":
      case "eq":
        return value === null
          ? setCondition(path, "isNull", true)
          : setCondition(path, "eq", value);
      case "ne":
        return value === null
          ? setCondition(path, "isNotNull", true)
          : setCondition(path, "ne", value);
      case "isNull":
      case "isNotNull": {
        const truthy = value === true || value === "true";
        const resolved =
          operator === "isNull"
            ? truthy
              ? "isNull"
              : "isNotNull"
            : truthy
            ? "isNotNull"
            : "isNull";
        return setCondition(path, resolved, true);
      }
      case "pgjson":
        // jsonb containment: { a: { b: 1 } } => column @> '{"a":{"b":1}}'
        return pushRaw(
          path,
          (column) => sql`${column} @> ${JSON.stringify(value)}::jsonb`,
        );
      case "search":
        return pushRaw(
          path,
          (column) =>
            sql`to_tsvector(${column}) @@ plainto_tsquery(${String(value)})`,
        );
      default:
        if (!(drizzleOperators as readonly string[]).includes(operator)) {
          throw new RDDError(
            `Unsupported filter operator "${operator}" in "${path}${OPERATOR_SEPARATOR}${operator}"`,
          );
        }
        return setCondition(
          path,
          operator,
          arrayOperators.has(operator) && !isArray(value) ? [value] : value,
        );
    }
  };

  const setWhere = (object: PlainObject, currentPath?: string) => {
    Object.entries(object).forEach(([field, value]) => {
      if (isNotField(field)) return;

      // react-admin does send empty strings in empty filters
      // and drizzle throws on undefined filter values
      if (value === "" || value === undefined) return;

      if (["OR", "AND"].includes(field)) {
        if (isArray(value) && value.every((item) => isObject(item))) {
          const conditions = value
            .map((item) => filterToWhere(item, options))
            .filter((item) => Object.keys(item).length);
          if (conditions.length)
            setObjectPath(where, joinPath(currentPath, field), conditions);
        }
        return;
      }

      if (field === "NOT") {
        if (isObject(value)) {
          const condition = filterToWhere(value, options);
          if (Object.keys(condition).length)
            setObjectPath(where, joinPath(currentPath, field), condition);
        }
        return;
      }

      if (field === "RAW") {
        throw new RDDError(`RAW filters are not allowed from the client`);
      }

      const { column, operator } = splitOperator(field);
      const path = joinPath(currentPath, column);

      if (operator !== undefined) {
        return applyOperator(path, operator, value);
      }

      if (field === "q") {
        // i.e. when filterToQuery is not set on AutoCompleteInput, but we don't know all the fields to search against
        console.info("ra-data-drizzle: Filter not handled:", field, value);
        return;
      }

      if (value === null) return setCondition(path, "isNull", true);

      if (
        isIdLikeField(field) ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return setCondition(path, "eq", value);
      }

      if (isArray(value)) return setCondition(path, "in", value);

      if (isString(value)) return applyOperator(path, "contains", value);

      if (isObject(value)) return setWhere(value, path); // relation filter

      console.info("ra-data-drizzle: Filter not handled", field, value);
    });
  };

  if (filter) setWhere(filter);

  if (!raws.length) return where;
  if (!Object.keys(where).length) {
    // raw only: a single RAW can be the whole filter
    return raws.length === 1 ? raws[0] : { AND: raws };
  }
  return { AND: [where, ...raws] };
};

const isEmptyWhere = (where?: DrizzleWhere | null) =>
  !where || Object.keys(where).length === 0;

/**
 * Combines `where` objects with AND, so that no condition (e.g. a server side one)
 * can be overridden by another (e.g. a client side one).
 */
export const mergeWhere = (
  ...wheres: (DrizzleWhere | null | undefined)[]
): DrizzleWhere | undefined => {
  const nonEmpty = wheres.filter((where) => !isEmptyWhere(where));
  if (nonEmpty.length === 0) return undefined;
  if (nonEmpty.length === 1) return nonEmpty[0]!;
  return { AND: nonEmpty };
};
