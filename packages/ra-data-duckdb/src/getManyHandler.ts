import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import { GetManyRequest } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";
import { SqlParams } from "./lib/SqlParams";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetManyOptions = {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  transformRow?: (data: any) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
};

export const getManyHandler = async (
  req: GetManyRequest,
  db: DuckDBExecutor,
  options?: GetManyOptions,
) => {
  const { ids } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);
  const pk = quoteIdent(primaryKey);

  if (!ids?.length) {
    return { data: [] };
  }

  const params = new SqlParams();
  const placeholders = ids.map((id) => params.add(id));
  const sql = `SELECT * FROM ${table} WHERE ${pk} IN (${placeholders.join(", ")})`;

  if (options?.debug) console.log("getManyHandler", sql, params.get());

  let data = await db.all(sql, params.get());

  if (options?.transformRow) {
    data = await Promise.all(data.map(options.transformRow));
  }
  if (options?.transformRows) {
    data = await options.transformRows(data);
  }

  return { data: mapPrimaryKeyToId(data, primaryKey) };
};
