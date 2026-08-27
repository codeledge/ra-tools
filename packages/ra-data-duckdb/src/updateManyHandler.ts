import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import { UpdateManyRequest } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";
import { SqlParams } from "./lib/SqlParams";
import { reduceData, UpdateOptions } from "./updateHandler";

export const updateManyHandler = async (
  req: UpdateManyRequest,
  db: DuckDBExecutor,
  options?: UpdateOptions,
) => {
  const { ids } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);
  const data = reduceData(req.params.data as Record<string, unknown>, options);

  if (options?.debug) console.log("updateManyHandler:data", data);

  if (!ids?.length) {
    return { data: [] };
  }

  const columns = Object.keys(data);
  if (!columns.length) {
    throw new Error("updateManyHandler: no fields to update");
  }

  const params = new SqlParams();
  const setSql = columns
    .map((col) => `${quoteIdent(col)} = ${params.add(data[col])}`)
    .join(", ");
  const placeholders = ids.map((id) => params.add(id));

  const sql = `UPDATE ${table} SET ${setSql} WHERE ${quoteIdent(primaryKey)} IN (${placeholders.join(", ")})`;

  if (options?.debug) console.log("updateManyHandler:sql", sql, params.get());

  await db.run(sql, params.get());

  return { data: ids };
};
