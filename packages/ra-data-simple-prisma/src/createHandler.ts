import { CreateRequest, Response } from "./Http";

export const createHandler = async <T extends { create: Function }>(
  req: CreateRequest,
  res: Response,
  table: T,
  options?: {
    connect?: {
      [key: string]: string;
    };
  }
) => {
  const { data } = req.body.params;

  // transfor an array to a connect (many-to-many)
  Object.entries(data).forEach(([prop, value]) => {
    const foreignConnectKey = options?.connect?.[prop];
    if (foreignConnectKey) {
      data[prop] = {
        connect: value.map((key) => ({ [foreignConnectKey]: key })),
      };
    }
  });

  const created = await table.create({
    data,
  });

  return res.json({ data: created });
};
