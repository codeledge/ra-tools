import { GetOneRequest, Response } from "./Http";

export const getOneHandler = async <
  W extends {
    include?: object | null;
    select?: object | null;
  }
>(
  req: GetOneRequest,
  res: Response,
  table: { findUnique: Function },
  arg?: W
) => {
  const row = await table.findUnique({
    where: { id: +req.body.params.id },
    select: arg?.select ?? undefined,
    include: arg?.include ?? undefined,
  });
  return res.json({ data: row });
};
