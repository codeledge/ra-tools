import { GetOneRequest, Response } from "./Http";

export type GetOneArgs = {
  include?: object | null;
  select?: object | null;
};

export type GetOneOptions<Args extends GetOneArgs = GetOneArgs> = {
  select?: Args["select"];
  include?: Args["include"];
  debug?: boolean;
  transform?: (row: any) => any;
};

export const getOneHandler = async <Args extends GetOneArgs>(
  req: GetOneRequest,
  res: Response,
  model: { findUnique: Function },
  options?: GetOneOptions<Args>
) => {
  const { id } = req.body.params;

  const where = { id };

  if (options?.debug) console.log("getOneHandler:where", where);

  const row = await model.findUnique({
    where,
    select: options?.select ?? undefined,
    include: options?.include ?? undefined,
  });

  if (options?.debug) console.log("getOneHandler:beforeTransform", row);

  await options?.transform?.(row);

  if (options?.debug) console.log("getOneHandler:afterTransform", row);

  res.json({ data: row });
};
