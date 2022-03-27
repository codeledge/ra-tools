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

  if (filter) {
    Object.entries(filter).forEach(([colName, value]) => {
      //ignore underscored fields (_count, _sum, _avg, _min, _max and _helpers)
      if (colName.startsWith("_")) return;

      if (
        colName === "id" ||
        colName === "uuid" ||
        colName === "cuid" ||
        colName.endsWith("_id") ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        queryArgs.findManyArg.where[colName] = value;
        queryArgs.countArg.where[colName] = value;
      } else if (Array.isArray(value)) {
        queryArgs.findManyArg.where[colName] = { in: value };
        queryArgs.countArg.where[colName] = { in: value };
      } else if (typeof value === "string") {
        queryArgs.findManyArg.where[colName] = { contains: value };
        queryArgs.countArg.where[colName] = { contains: value };
      }
    });
  }

  if (pagination) {
    const { page, perPage } = pagination;

    const first = (page - 1) * perPage;
    const last = page * perPage - 1;

    if (first === 0 && last === 999) {
      // Hack: do nothing
      // This is when the export button is hit, the free version only allows 1000 records :)
    } else {
      queryArgs.findManyArg.skip = first;
      queryArgs.findManyArg.take = last - first + 1;
    }
  }

  if (sort) {
    const { field, order } = sort;
    if (field && order) {
      if (field.includes(".")) {
        const [relation, subfield] = field.split(".");
        queryArgs.findManyArg.orderBy = {
          [relation]: { [subfield]: order.toLowerCase() },
        };
      } else {
        queryArgs.findManyArg.orderBy = { [field]: order.toLowerCase() };
      }
    }

    if (options?.noNullsOnSort?.includes(field)) {
      queryArgs.findManyArg.where = { [field]: { not: null } };
      queryArgs.countArg.where = { [field]: { not: null } };
    }
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
