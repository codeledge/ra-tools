import { DuckDBExecutor } from "./duckdb";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { andWhere, extractWhere, FilterMode } from "./extractWhere";
import { getTable, type ResourceToTableMap } from "./getTable";
import { GetListRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetListOptions = {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  filterMode?: FilterMode;
  searchColumns?: string[];
  /** Extra SQL AND condition (no leading WHERE/AND), e.g. `"active" = true` */
  extraWhere?: string;
  transformRow?: (
    row: any,
    rowIndex: number,
    rows: any[],
  ) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
};

export const getListHandler = async (
  req: GetListRequest,
  db: DuckDBExecutor,
  options?: GetListOptions,
) => {
  const table = getTable(req, options?.resourceToTableMap);
  const primaryKey = options?.primaryKey ?? "id";

  let where = extractWhere(req, {
    filterMode: options?.filterMode,
    debug: options?.debug,
    searchColumns: options?.searchColumns,
    primaryKey,
  });

  if (options?.extraWhere) {
    where = andWhere(where, options.extraWhere);
  }

  const { skip, take } = extractSkipTake(req);
  const orderBy = extractOrderBy(req, primaryKey);

  const limitSql =
    take != null
      ? `LIMIT ${Math.max(0, take)}${skip != null ? ` OFFSET ${Math.max(0, skip)}` : ""}`
      : skip != null
        ? `OFFSET ${Math.max(0, skip)}`
        : "";

  const listSql = [
    `SELECT * FROM ${table}`,
    where.sql,
    orderBy,
    limitSql,
  ]
    .filter(Boolean)
    .join(" ");

  const countSql = [`SELECT COUNT(*) AS total FROM ${table}`, where.sql]
    .filter(Boolean)
    .join(" ");

  if (options?.debug) {
    console.log("getListHandler:listSql", listSql, where.params);
    console.log("getListHandler:countSql", countSql, where.params);
  }

  const [rows, countRows] = await Promise.all([
    db.all(listSql, where.params),
    db.all<{ total: number | bigint | string }>(countSql, where.params),
  ]);

  const total = Number(countRows[0]?.total ?? 0);

  let data = rows;

  if (options?.transformRow) {
    data = await Promise.all(
      data.map((row, i, arr) => options.transformRow!(row, i, arr)),
    );
  }

  if (options?.transformRows) {
    data = await options.transformRows(data);
  }

  return {
    data: mapPrimaryKeyToId(data, primaryKey),
    total,
  };
};
