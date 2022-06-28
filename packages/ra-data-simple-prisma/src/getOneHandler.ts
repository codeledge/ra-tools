import { GetOneRequest, Response } from "./Http";

export const getOneHandler = async <
  W extends {
    include?: object | null;
    select?: object | null;
  }
>(
  req: GetOneRequest,
  res: Response,
  model: { findUnique: Function },
  options?: {
    select?: W["select"];
    include?: W["include"];
    debug?: boolean;
    transform?: (row: any) => any;
  }
) => {
  const { id } = req.body.params;

  const row = await model.findUnique({
    where: { id },
    select: options?.select ?? undefined,
    include: options?.include ?? undefined,
  });

  if (options?.debug) console.log("getOneHandler:beforeTransform", row);

  await options?.transform?.(row);

  if (options?.debug) console.log("getOneHandler:afterTransform", row);

  res.json({ data: row });
};
