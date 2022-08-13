import { GetListRequest, Response } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";
import deepmerge from "deepmerge";

export type GetListArgs = {
  include?: object | null;
  select?: object | null;
  where?: object | null;
};

export type GetListOptions<Args extends GetListArgs = GetListArgs> = Args & {
  noNullsOnSort?: string[];
  debug?: boolean;
  transform?: (data: any) => any;
  filterMode?: FilterMode;
};

export const getListHandler = async <Args extends GetListArgs>(
  req: GetListRequest,
  res: Response,
  table: { findMany: Function; count: Function },
  options?: GetListOptions<Args>
) => {
  if (!table) throw new Error(`missing table in getListHandler`);

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
    console.log("getListHandler:where", JSON.stringify(where, null, 2));
  }

  queryArgs.findManyArg.where = deepmerge(queryArgs.findManyArg.where, where);
  queryArgs.countArg.where = deepmerge(queryArgs.countArg.where, where);

  // PAGINATION STAGE
  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take;

  // SORT STAGE
  const { sort } = req.body.params;
  if (sort) {
    queryArgs.findManyArg.orderBy = extractOrderBy(req);

    const { field } = sort;

    if (field && options?.noNullsOnSort?.includes(field)) {
      queryArgs.findManyArg.where = { [field]: { not: null } };
      queryArgs.countArg.where = { [field]: { not: null } };
    }
  }

  if (options?.debug) {
    console.log("getListHandler:queryArgs", JSON.stringify(queryArgs, null, 2));
  }

  // GET DATA
  const [data, total] = await Promise.all([
    table.findMany(queryArgs.findManyArg),
    table.count(queryArgs.countArg),
  ]);

  // TRANSFORM
  await options?.transform?.(data);

  // RESPOND WITH DATA
  res.json({
    data,
    total,
  });
};
