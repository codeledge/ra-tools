import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import type { CreateRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import { quoteIdent } from "./lib/quoteIdent";
import { SqlParams } from "./lib/SqlParams";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type CreateOptions = {
  allowOnlyFields?: Record<string, boolean>;
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

const sanitizeWriteData = (
  data: Record<string, unknown>,
  options?: CreateOptions,
) => {
  const primaryKey = options?.primaryKey ?? "id";
  const cleaned: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    // With a custom primary key, `id` is only React-admin's response alias.
    if (primaryKey !== "id" && key === "id") return;
    if (primaryKey !== "id" && key === primaryKey) {
      throw new Error(
        `createHandler: Field ${key} is reserved when primaryKey is configured; use id in responses and omit the original primary key from writes`,
      );
    }
    if (value === "") return;
    if (isNotField(key)) return;
    if (options?.allowOnlyFields && !options.allowOnlyFields[key]) {
      throw new Error(`createHandler: Field ${key} is not allowed in create`);
    }
    cleaned[key] = value;
  });

  return cleaned;
};

export const createHandler = async (
  req: CreateRequest,
  db: DuckDBExecutor,
  options?: CreateOptions,
) => {
  const table = getTable(req, options?.resourceToTableMap);
  const primaryKey = options?.primaryKey ?? "id";
  const data = sanitizeWriteData(req.params.data as Record<string, unknown>, options);

  if (options?.debug) console.log("createHandler:data", data);

  const columns = Object.keys(data);
  if (!columns.length) {
    throw new Error("createHandler: no fields to insert");
  }

  const params = new SqlParams();
  const placeholders = columns.map((col) => params.add(data[col]));
  const columnSql = columns.map(quoteIdent).join(", ");

  const sql = `INSERT INTO ${table} (${columnSql}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  if (options?.debug) console.log("createHandler:sql", sql, params.get());

  const rows = await db.all(sql, params.get());
  const created = rows[0];

  return { data: mapPrimaryKeyToId(created, primaryKey) };
};
