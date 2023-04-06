import { GetOneRequest, Response } from "./Http";

export type GetOneArgs = {
  include?: object | null;
  select?: object | null;
  // there is no where because it's always id based
};

export type GetOneOptions<Args extends GetOneArgs = GetOneArgs> = Args & {
  debug?: boolean;
  transform?: (row: any) => any;
};

export const getOneHandler = async <Args extends GetOneArgs>(
  req: GetOneRequest,
  res: Response,
  model: { findUnique: Function },
  options?: GetOneOptions<Omit<Args, "where">> // omit where so the Prisma.ModelFindUniqueArgs can be passed in, without complaining about the where property missing
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

  const response = { data: row };
  res.json(response);
  return response;
};
