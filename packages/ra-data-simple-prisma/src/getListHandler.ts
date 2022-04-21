import { extractSkipTake } from "./extractSkipTake";
import { extractOrderBy } from "./extractOrderBy";
import { extractWhere } from "./extractWhere";
import { GetListRequest, Response } from "./Http";

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
  const { pagination, sort, filter } = req.body.params;

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

  if (!table) throw new Error(`missing table in getListHandler`);

  const where = extractWhere(req);
  queryArgs.findManyArg.where = where;
  queryArgs.countArg.where = where;

  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take;

  if (sort) {
    queryArgs.findManyArg.orderBy = extractOrderBy(req);

    const { field } = sort;

    if (field && options?.noNullsOnSort?.includes(field)) {
      queryArgs.findManyArg.where = { [field]: { not: null } };
      queryArgs.countArg.where = { [field]: { not: null } };
    }
  }

  if (options?.debug) {
    console.log("queryArgs", JSON.stringify(queryArgs, null, 2));
  }

  const [data, total] = await Promise.all([
    table.findMany(queryArgs.findManyArg),
    table.count(queryArgs.countArg),
  ]);

  await options?.transform?.(data);

  res.json({
    data,
    total,
  });
};
