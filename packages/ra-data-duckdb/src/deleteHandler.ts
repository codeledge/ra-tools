import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import { DeleteRequest } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type DeleteOptions = {
  softDeleteField?: string;
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const deleteHandler = async (
  req: DeleteRequest,
  db: DuckDBExecutor,
  options?: DeleteOptions,
) => {
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);
  const pk = quoteIdent(primaryKey);

  const sql = options?.softDeleteField
    ? `UPDATE ${table} SET ${quoteIdent(options.softDeleteField)} = CURRENT_TIMESTAMP WHERE ${pk} = $id RETURNING *`
    : `DELETE FROM ${table} WHERE ${pk} = $id RETURNING *`;

  if (options?.debug) console.log("deleteHandler", sql, { id });

  const rows = await db.all(sql, { id });
  const deleted = rows[0];

  return { data: mapPrimaryKeyToId(deleted, primaryKey) };
};
