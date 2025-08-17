import { stringify } from "deverything";
import { GetListRequest } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";
import { getModel } from "./getModel";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type GetListArgs = {
  include?: object | null;
  select?: object | null;
  where?: object | null;
  orderBy?: object | null;
};

export type GetListOptions<Args extends GetListArgs = GetListArgs> = Args & {
  noNullsOnSort?: string[]; // TODO: to be keyof Args["orderBy"] CAREFUL field must be nullable, or prisma will throw
  debug?: boolean;
  transformRow?: (
    row: any,
    rowIndex: number,
    rows: any[]
  ) => any | Promise<any>;
  filterMode?: FilterMode;
};

export const getListHandler = async <Args extends GetListArgs>(
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
    countArg: {
      where: object;
    };
  } = {
    findManyArg: {
      // skip: options?.skip ?? undefined, TODO
      // take: options?.take ?? undefined, TODO
      include: options?.include ?? undefined,
      orderBy: options?.orderBy ?? undefined,
      select: options?.select ?? undefined,
      where: options?.where ?? {},
    },
    countArg: {
      where: options?.where ?? {},
    },
  };

  // FILTER STAGE
  const requestWhere = extractWhere(req, {
    filterMode: options?.filterMode,
  });

  if (options?.debug) {
    console.debug("getListHandler:requestWhere", stringify(requestWhere));
  }

  queryArgs.findManyArg.where = {
    ...requestWhere, // Make sure request where never wins on server options
    ...queryArgs.findManyArg.where,
  };
  queryArgs.countArg.where = {
    ...requestWhere, // Make sure request where never wins on server options
    ...queryArgs.countArg.where,
  };

  // PAGINATION STAGE
  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take;

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
        [field]: { not: null },
      };
      queryArgs.countArg.where = {
        ...queryArgs.countArg.where,
        [field]: { not: null },
      };
    }
  }

  if (options?.debug) {
    console.log("getListHandler:queryArgs", stringify(queryArgs));
  }

  // GET DATA
  const [rows, total] = await Promise.all([
    model.findMany(queryArgs.findManyArg),
    model.count(queryArgs.countArg),
  ]);

  if (options?.debug) {
    console.log("getListHandler:total", total);
  }

  // TRANSFORM DATA
  const data = options?.transformRow
    ? await Promise.all(rows.map(options.transformRow))
    : rows;

  // RESPOND WITH DATA
  const response = {
    data,
    total,
  };

  return response;
};
