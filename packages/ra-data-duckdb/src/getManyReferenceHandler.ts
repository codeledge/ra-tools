import { DuckDBExecutor } from "./duckdb";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { andWhere, extractWhere, FilterMode } from "./extractWhere";
import { getTable, type ResourceToTableMap } from "./getTable";
import { GetManyReferenceRequest } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetManyReferenceOptions = {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  filterMode?: FilterMode;
  searchColumns?: string[];
  transformRow?: (data: any) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
};

export const getManyReferenceHandler = async (
  req: GetManyReferenceRequest,
  db: DuckDBExecutor,
  options?: GetManyReferenceOptions,
) => {
  const { id, target } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const table = getTable(req, options?.resourceToTableMap);

  let where = extractWhere(req, {
    filterMode: options?.filterMode,
    debug: options?.debug,
    searchColumns: options?.searchColumns,
    primaryKey,
  });

  where = andWhere(where, `${quoteIdent(target)} = $refId`, { refId: id });

  const { skip, take } = extractSkipTake(req);
  const orderBy = extractOrderBy(req, primaryKey);

  const limitSql =
    take != null
      ? `LIMIT ${Math.max(0, take)}${skip != null ? ` OFFSET ${Math.max(0, skip)}` : ""}`
      : skip != null
        ? `OFFSET ${Math.max(0, skip)}`
        : "";

  const listSql = [`SELECT * FROM ${table}`, where.sql, orderBy, limitSql]
    .filter(Boolean)
    .join(" ");

  const countSql = [`SELECT COUNT(*) AS total FROM ${table}`, where.sql]
    .filter(Boolean)
    .join(" ");

  if (options?.debug) {
    console.log("getManyReferenceHandler", listSql, where.params);
  }

  const [rows, countRows] = await Promise.all([
    db.all(listSql, where.params),
    db.all<{ total: number | bigint | string }>(countSql, where.params),
  ]);

  let data = rows;

  if (options?.transformRow) {
    data = await Promise.all(data.map(options.transformRow));
  }
  if (options?.transformRows) {
    data = await options.transformRows(data);
  }

  return {
    data: mapPrimaryKeyToId(data, primaryKey),
    total: Number(countRows[0]?.total ?? 0),
  };
};
