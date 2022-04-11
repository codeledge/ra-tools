import { CreateRequest, Response } from "./Http";

export const createHandler = async <T extends { create: Function }>(
  req: CreateRequest,
  res: Response,
  table: T
) => {
  const created = await table.create({
    data: req.body.params.data,
  });

  return res.json({ data: created });
};
