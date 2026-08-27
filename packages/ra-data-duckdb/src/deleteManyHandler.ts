import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import { DeleteManyRequest } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";
import { SqlParams } from "./lib/SqlParams";

export type DeleteManyOptions = {
  softDeleteField?: string;
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const deleteManyHandler = async (
  req: DeleteManyRequest,
  db: DuckDBExecutor,
  options?: DeleteManyOptions,
) => {
  const { ids } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);

  if (!ids?.length) {
    return { data: [] };
  }

  const params = new SqlParams();
  const placeholders = ids.map((id) => params.add(id));
  const pk = quoteIdent(primaryKey);

  const sql = options?.softDeleteField
    ? `UPDATE ${table} SET ${quoteIdent(options.softDeleteField)} = CURRENT_TIMESTAMP WHERE ${pk} IN (${placeholders.join(", ")})`
    : `DELETE FROM ${table} WHERE ${pk} IN (${placeholders.join(", ")})`;

  if (options?.debug) console.log("deleteManyHandler", sql, params.get());

  await db.run(sql, params.get());

  return { data: ids };
};
