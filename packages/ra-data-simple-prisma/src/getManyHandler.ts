import { GetManyRequest } from "./Http";

export type GetManyArgs = {
  include?: object | null;
  select?: object | null;
};

export type GetManyOptions<Args extends GetManyArgs = GetManyArgs> = Args & {
  debug?: boolean;
  transformRow?: (data: any) => any | Promise<any>;
};

export const getManyHandler = async <Args extends GetManyArgs>(
  req: GetManyRequest,
  model: { findMany: Function },
  options?: GetManyOptions<Args>
) => {
  const { ids } = req.params;

  // GET DATA
  const rows = await model.findMany({
    include: options?.include,
    select: options?.select,
    where: { id: { in: ids } },
  });

  // TRANSFORM
  const data = options?.transformRow
    ? await Promise.all(rows.map(options.transformRow))
    : rows;

  const response = { data };

  return response;
};
