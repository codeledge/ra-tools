import { stringify } from "deverything";
import type {
  DrizzleDatabase,
  DrizzleOrderBy,
  DrizzleQueryArgs,
  DrizzleWhere,
  ResourceToTableMap,
} from "./DrizzleTypes";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, type FilterMode, mergeWhere } from "./extractWhere";
import { getTable } from "./getTable";
import type { GetListRequest } from "./Http";
import { compact } from "./lib/compact";
import { countRows } from "./lib/countRows";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetListArgs = DrizzleQueryArgs & {
  where?: DrizzleWhere | null;
  orderBy?: DrizzleOrderBy | ((table: any, operators: any) => any) | null;
};

export type GetListOptions<Args extends GetListArgs = GetListArgs> = Args & {
  noNullsOnSort?: string[];
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  transformRow?: (
    row: any,
    rowIndex: number,
    rows: any[],
  ) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
  filterMode?: FilterMode;
};

/** Shared by getList and getInfiniteList */
export const buildListQuery = (
  req: GetListRequest,
  options: GetListOptions | undefined,
  debugLabel: string,
) => {
  // FILTER STAGE
  const requestWhere = extractWhere(req, { filterMode: options?.filterMode });

  if (options?.debug) {
    console.debug(`${debugLabel}:requestWhere`, stringify(requestWhere));
  }

  // server where is ANDed, so the request can never loosen it
  let where = mergeWhere(requestWhere, options?.where);

  // PAGINATION STAGE
  const { skip, take } = extractSkipTake(req);

  // SORT STAGE
  let orderBy = options?.orderBy ?? undefined;
  const { sort: requestSort } = req.params;
  if (
    requestSort &&
    !options?.orderBy // because they are mutually exclusive
  ) {
    orderBy = extractOrderBy(req);

    const { field } = requestSort;
    if (field && options?.noNullsOnSort?.includes(field)) {
      where = mergeWhere(where, { [field]: { isNotNull: true } });
    }
  }

  return {
    where,
    skip,
    take,
    findManyArg: compact({
      columns: options?.columns,
      with: options?.with,
      extras: options?.extras,
      where,
      orderBy,
      offset: skip,
      limit: take,
    }),
  };
};

export const transformListRows = async (
  rows: any[],
  options?: Pick<GetListOptions, "transformRow" | "transformRows">,
) => {
  let data = rows;

  if (options?.transformRow) {
    data = await Promise.all(data.map(options.transformRow));
  }

  if (options?.transformRows) {
    data = await options.transformRows(data);
  }

  return data;
};

export const getListHandler = async <Args extends GetListArgs>(
  req: GetListRequest,
  db: DrizzleDatabase,
  options?: GetListOptions<Args>,
) => {
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const primaryKey = options?.primaryKey ?? "id";

  const { where, findManyArg } = buildListQuery(req, options, "getListHandler");

  if (options?.debug) {
    console.log("getListHandler:findManyArg", stringify(findManyArg));
  }

  // GET DATA
  const [rows, total] = await Promise.all([
    drizzleTable.query.findMany(findManyArg),
    countRows(db, drizzleTable, where),
  ]);

  if (options?.debug) {
    console.log("getListHandler:total", total);
  }

  // TRANSFORM DATA
  const data = await transformListRows(rows, options);

  // RESPOND WITH DATA
  return {
    data: mapPrimaryKeyToId(data, primaryKey),
    total,
  };
};
