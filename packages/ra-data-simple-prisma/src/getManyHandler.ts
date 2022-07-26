import { GetManyRequest, Response } from "./Http";

export const getManyHandler = async (
  req: GetManyRequest,
  res: Response,
  model: { findMany: Function }
) => {
  const { ids } = req.body.params;

  const list = await model.findMany({
    where: { id: { in: ids } },
  });

  res.json({ data: list });
};
