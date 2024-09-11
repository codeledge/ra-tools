import { GetListRequest } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere } from "./extractWhere";
import deepmerge from "deepmerge";
import { GetListArgs, GetListOptions } from "./getListHandler";
import { stringify } from "deverything";

export const getInfiniteListHandler = async <Args extends GetListArgs>(
  req: GetListRequest,
  model: { findMany: Function; count: Function },
  options?: GetListOptions<Args>
) => {
  if (!model) throw new Error(`missing model in getInfiniteListHandler`);

  let queryArgs: {
    findManyArg: {
      include?: object;
      orderBy?: object;
      select?: object;
      skip?: number;
      take?: number;
      where: object;
    };
  } = {
    findManyArg: {
      select: options?.select ?? undefined,
      include: options?.include ?? undefined,
      where: options?.where ?? {},
    },
  };

  // FILTER STAGE
  const where = extractWhere(req, {
    filterMode: options?.filterMode,
  });

  if (options?.debug) {
    console.log("getInfiniteListHandler:where", stringify(where));
  }

  queryArgs.findManyArg.where = deepmerge(queryArgs.findManyArg.where, where);

  // PAGINATION STAGE
  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take + 1; // +1 to check for next page

  // SORT STAGE
  const { sort } = req.params;
  if (sort) {
    queryArgs.findManyArg.orderBy = extractOrderBy(req);

    const { field } = sort;

    if (field && options?.noNullsOnSort?.includes(field)) {
      queryArgs.findManyArg.where = deepmerge(queryArgs.findManyArg.where, {
        [field]: { not: null },
      });
    }
  }

  if (options?.debug) {
    console.log("getInfiniteListHandler:queryArgs", stringify(queryArgs));
  }

  // GET DATA
  let rows = await model.findMany(queryArgs.findManyArg);

  const hasNextPage = rows.length > take;

  if (hasNextPage) {
    rows = rows.slice(0, take);
  }

  // TRANSFORM DATA
  const data = options?.transformRow
    ? await Promise.all(rows.map(options.transformRow))
    : rows;

  // RESPOND WITH DATA
  const response = {
    data,
    pageInfo: {
      hasPreviousPage: skip > 0,
      hasNextPage,
    },
  };

  return response;
};
