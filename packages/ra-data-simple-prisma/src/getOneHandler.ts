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
  options?: {
    select?: W["select"];
    include?: W["include"];
    debug?: boolean;
    transform?: (row: any) => any;
  }
) => {
  const row = await table.findUnique({
    where: { id: +req.body.params.id },
    select: options?.select ?? undefined,
    include: options?.include ?? undefined,
  });

  await options?.transform?.(row);

  return res.json({ data: row });
};
