import { GetListRequest, Response } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere } from "./extractWhere";
import deepmerge from "deepmerge";

export type GetListOptions = {
  noNullsOnSort?: string[];
  debug?: boolean;
  transform?: (data: any) => any;
};

export const getListHandler = async <
  W extends {
    include?: object | null;
    orderBy?: object | null;
    select?: object | null;
    skip?: number | null;
    take?: number | null;
    where?: object | null;
  }
>(
  req: GetListRequest,
  res: Response,
  table: { findMany: Function; count: Function },
  options?: {
    select?: W["select"];
    include?: W["include"];
    where?: W["where"];
    noNullsOnSort?: string[];
    debug?: boolean;
    transform?: (data: any) => any;
  }
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
  const where = extractWhere(req);

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
