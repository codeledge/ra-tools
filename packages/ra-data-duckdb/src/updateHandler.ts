import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import type { UpdateRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import { NotFoundError } from "./lib/NotFoundError";
import { quoteIdent } from "./lib/quoteIdent";
import { SqlParams } from "./lib/SqlParams";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type UpdateOptions = {
  debug?: boolean;
  skipFields?: Record<string, boolean>;
  allowOnlyFields?: Record<string, boolean>;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const reduceData = (
  data: Record<string, unknown>,
  options?: UpdateOptions,
) => {
  const primaryKey = options?.primaryKey ?? "id";
  const fields: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    // React-admin includes its record identifier in `data`. It is used in the
    // WHERE clause and must not be written back, especially when `id` is only
    // an alias for a custom primary key.
    if (key === "id") return;
    if (primaryKey !== "id" && key === primaryKey) {
      throw new Error(
        `updateHandler: Field ${key} is reserved when primaryKey is configured; use params.id and omit the original primary key from writes`,
      );
    }
    if (isNotField(key)) return;
    if (options?.skipFields?.[key]) return;
    if (options?.allowOnlyFields && !options.allowOnlyFields[key]) {
      throw new Error(`updateHandler: Field ${key} is not allowed in update`);
    }
    fields[key] = value;
  });

  return fields;
};

export const updateHandler = async (
  req: UpdateRequest,
  db: DuckDBExecutor,
  options?: UpdateOptions,
) => {
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);
  const data = reduceData(req.params.data as Record<string, unknown>, options);

  if (options?.debug) console.log("updateHandler:data", data);

  const columns = Object.keys(data);
  if (!columns.length) {
    throw new Error("updateHandler: no fields to update");
  }

  const params = new SqlParams();
  const setSql = columns
    .map((col) => `${quoteIdent(col)} = ${params.add(data[col])}`)
    .join(", ");
  const idPlaceholder = params.add(id);

  const sql = `UPDATE ${table} SET ${setSql} WHERE ${quoteIdent(primaryKey)} = ${idPlaceholder} RETURNING *`;

  if (options?.debug) console.log("updateHandler:sql", sql, params.get());

  const rows = await db.all(sql, params.get());
  const updated = rows[0];
  if (!updated) {
    throw new NotFoundError(
      `updateHandler: no row found in ${table} for ${primaryKey}=${id}`,
    );
  }

  return { data: mapPrimaryKeyToId(updated, primaryKey) };
};
