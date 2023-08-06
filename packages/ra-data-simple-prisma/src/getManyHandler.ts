import { GetManyRequest } from "./Http";

export type GetManyArgs = {
  include?: object | null;
  select?: object | null;
};

export type GetManyOptions<Args extends GetManyArgs = GetManyArgs> = Args & {
  debug?: boolean;
  transform?: (data: any) => any;
};

export const getManyHandler = async <Args extends GetManyArgs>(
  req: GetManyRequest,
  model: { findMany: Function },
  options?: GetManyOptions<Args>
) => {
  const { ids } = req.params;

  // GET DATA
  const data = await model.findMany({
    include: options?.include,
    select: options?.select,
    where: { id: { in: ids } },
  });

  // TRANSFORM
  await options?.transform?.(data);

  const response = { data };

  return response;
};
