import { extractGetListSkipTake } from "./extractGetListSkipTake";
import { extractGetListOrderBy } from "./extractGetListOrderBy";
import { extractGetListWhere } from "./extractGetListWhere";
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
  arg?: W,
  options?: {
    noNullsOnSort?: string[];
    debug?: boolean;
    hydrationFunction?: (data: any) => any;
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
      select: arg?.select ?? undefined,
      include: arg?.include ?? undefined,
      where: arg?.where ?? {},
    },
    countArg: {
      where: arg?.where ?? {},
    },
  };

  const where = extractGetListWhere(req);
  queryArgs.findManyArg.where = where;
  queryArgs.countArg.where = where;

  const { skip, take } = extractGetListSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take;

  if (sort) {
    queryArgs.findManyArg.orderBy = extractGetListOrderBy(req);

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

  await options?.hydrationFunction?.(data);

  res.json({
    data,
    total,
  });
};
