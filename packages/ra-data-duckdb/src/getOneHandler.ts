import { DuckDBExecutor } from "./duckdb";
import { getTable, type ResourceToTableMap } from "./getTable";
import { GetOneRequest } from "./Http";
import { NotFoundError } from "./lib/NotFoundError";
import { quoteIdent } from "./lib/quoteIdent";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetOneOptions = {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  transform?: (row: any) => any | Promise<any>;
};

export const getOneHandler = async (
  req: GetOneRequest,
  db: DuckDBExecutor,
  options?: GetOneOptions,
) => {
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);
  const pk = quoteIdent(primaryKey);

  const sql = `SELECT * FROM ${table} WHERE ${pk} = $id LIMIT 1`;

  if (options?.debug) console.log("getOneHandler", sql, { id });

  const rows = await db.all(sql, { id });
  const row = rows[0];
  if (!row) {
    throw new NotFoundError(
      `getOneHandler: no row found in ${table} for ${primaryKey}=${id}`,
    );
  }

  const transformedRow = options?.transform
    ? await options.transform(row)
    : row;

  return { data: mapPrimaryKeyToId(transformedRow, primaryKey) };
};
