import { GetListRequest } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere } from "./extractWhere";
import { GetListArgs, GetListOptions } from "./getListHandler";
import { stringify } from "deverything";
import { getModel } from "./getModel";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export const getInfiniteListHandler = async <Args extends GetListArgs>(
  req: GetListRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: GetListOptions<Args>
) => {
  const model = getModel(req, prismaClient);

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
      include: options?.include ?? undefined,
      orderBy: options?.orderBy ?? undefined,
      select: options?.select ?? undefined,
      where: options?.where ?? {},
    },
  };

  // FILTER STAGE
  const requestWhere = extractWhere(req, {
    filterMode: options?.filterMode,
  });

  if (options?.debug) {
    console.log("getInfiniteListHandler:requestWhere", stringify(requestWhere));
  }

  queryArgs.findManyArg.where = {
    ...requestWhere, // Make sure request where never wins on server options
    ...queryArgs.findManyArg.where,
  };

  // PAGINATION STAGE
  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take + 1; // +1 to check for next page

  // SORT STAGE
  const { sort: requestSort } = req.params;
  // Not yet, because react admin alawys sends the default sort
  // if (requestSort && queryArgs.findManyArg.orderBy) {
  //   console.warn(
  //     "getListHandler: skipping requestSort",
  //     stringify(requestSort)
  //   );
  // }
  if (
    requestSort &&
    !options?.orderBy // because they are mutually exclusive
  ) {
    queryArgs.findManyArg.orderBy = extractOrderBy(req);

    const { field } = requestSort;

    if (field && options?.noNullsOnSort?.includes(field)) {
      queryArgs.findManyArg.where = {
        ...queryArgs.findManyArg.where,
        [field]: { not: null }, // surely wins
      };
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
