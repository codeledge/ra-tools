export const dataHandler = async (body, prisma) => {
  console.log(body);

  const table = prisma[body.resource];

  switch (body.action) {
    case "getList": {
      const { pagination, sort, filter } = body.params;

      let queryArgs: {
        findManyArg: {
          skip?: number;
          take?: number;
          orderBy?: Record<string, string>;
          where: Record<string, any>;
        };
        countArg: {
          where: Record<string, any>;
        };
      } = {
        findManyArg: {
          where: {},
        },
        countArg: {
          where: {},
        },
      };

      if (filter) {
        Object.entries(filter).forEach(([colName, value]) => {
          if (
            colName === "uuid" ||
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
        queryArgs.findManyArg.orderBy = { [field]: order.toLowerCase() };
      }

      const [data, total] = await Promise.all([
        table.findMany(queryArgs.findManyArg),
        table.count(queryArgs.countArg),
      ]);

      return {
        data,
        total,
      };
    }
    case "getOne": {
      const { id } = body.params;

      const data = await table.findUnique({ where: { id: +id } });

      return {
        data,
      };
    }
    default:
      return Promise.reject(new Error("Not implemented"));
  }
};
