import { stringify } from "deverything";
import type { DrizzleDatabase } from "./DrizzleTypes";
import {
  buildListQuery,
  type GetListArgs,
  type GetListOptions,
  transformListRows,
} from "./getListHandler";
import { getTable } from "./getTable";
import type { GetListRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export const getInfiniteListHandler = async <Args extends GetListArgs>(
  req: GetListRequest,
  db: DrizzleDatabase,
  options?: GetListOptions<Args>,
) => {
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const primaryKey = options?.primaryKey ?? "id";

  const { skip = 0, take, findManyArg } = buildListQuery(
    req,
    options,
    "getInfiniteListHandler",
  );

  if (take !== undefined) findManyArg.limit = take + 1; // +1 to check for next page

  if (options?.debug) {
    console.log("getInfiniteListHandler:findManyArg", stringify(findManyArg));
  }

  // GET DATA
  let rows = await drizzleTable.query.findMany(findManyArg);

  const hasNextPage = take !== undefined && rows.length > take;

  if (hasNextPage) {
    rows = rows.slice(0, take);
  }

  // TRANSFORM DATA
  const data = await transformListRows(rows, options);

  // RESPOND WITH DATA
  return {
    data: mapPrimaryKeyToId(data, primaryKey),
    pageInfo: {
      hasPreviousPage: skip > 0,
      hasNextPage,
    },
  };
};
