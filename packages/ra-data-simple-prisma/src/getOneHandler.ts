import { GetOneRequest } from "./Http";

export type GetOneArgs = {
  include?: object | null;
  select?: object | null;
  // there is no where because it's always id based
};

export type GetOneOptions<Args extends GetOneArgs = GetOneArgs> = Args & {
  debug?: boolean;
  transform?: (row: any) => void;
  mapRow?: (row: any) => any;
};

export const getOneHandler = async <Args extends GetOneArgs>(
  req: GetOneRequest,
  model: { findUnique: Function },
  options?: GetOneOptions<Omit<Args, "where">> // omit where so the Prisma.ModelFindUniqueArgs can be passed in, without complaining about the where property missing
) => {
  const { id } = req.params;

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

  const mappedRow = options?.mapRow ? await options.mapRow(row) : row;

  if (options?.debug) console.log("getOneHandler:mappedRow", mappedRow);

  const response = { data: mappedRow };

  return response;
};
