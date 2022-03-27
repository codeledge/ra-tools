import { GetManyRequest, Response } from "./Http";

export const getManyHandler = async (
  req: GetManyRequest,
  res: Response,
  table: { findMany: Function }
) => {
  const { ids } = req.body.params;

  const list = await table.findMany({
    where: { id: { in: ids } },
  });

  res.json({ data: list });
};
