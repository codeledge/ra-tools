import { pretty } from "deverything";
import { GetListRequest } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";
import deepmerge from "deepmerge";

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
  model: { findMany: Function; count: Function },
  options?: GetListOptions<Args>
) => {
  if (!model) throw new Error(`missing model in getListHandler`);

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
      select: options?.select ?? undefined,
      include: options?.include ?? undefined,
      where: options?.where ?? {},
    },
    countArg: {
      where: options?.where ?? {},
    },
  };

  // FILTER STAGE
  const where = extractWhere(req, {
    filterMode: options?.filterMode,
  });

  if (options?.debug) {
    console.debug("getListHandler:where", pretty(where));
  }

  queryArgs.findManyArg.where = deepmerge(queryArgs.findManyArg.where, where);
  queryArgs.countArg.where = deepmerge(queryArgs.countArg.where, where);

  // PAGINATION STAGE
  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take;

  // SORT STAGE
  const { sort } = req.params;
  if (sort) {
    queryArgs.findManyArg.orderBy = extractOrderBy(req);

    const { field } = sort;

    if (field && options?.noNullsOnSort?.includes(field)) {
      queryArgs.findManyArg.where = deepmerge(queryArgs.findManyArg.where, {
        [field]: { not: null },
      });
      queryArgs.countArg.where = deepmerge(queryArgs.countArg.where, {
        [field]: { not: null },
      });
    }
  }

  if (options?.debug) {
    console.log("getListHandler:queryArgs", pretty(queryArgs));
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
