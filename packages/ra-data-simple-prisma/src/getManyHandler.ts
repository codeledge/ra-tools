import { getModel } from "./getModel";
import { GetManyRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type GetManyArgs = {
  include?: object | null;
  select?: object | null;
  omit?: object | null;
};

export type GetManyOptions<Args extends GetManyArgs = GetManyArgs> = Args & {
  debug?: boolean;
  primaryKey?: string;
  transformRow?: (data: any) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
};

export const getManyHandler = async <Args extends GetManyArgs>(
  req: GetManyRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: GetManyOptions<Args>,
) => {
  const { ids } = req.params;
  const model = getModel(req, prismaClient);

  const primaryKey = options?.primaryKey ?? "id";

  // GET DATA
  const rows = await model.findMany({
    include: options?.include,
    select: options?.select,
    omit: options?.omit,
    where: { [primaryKey]: { in: ids } },
  });

  // TRANSFORM
  let data = rows;

  if (options?.transformRow) {
    data = await Promise.all(data.map(options.transformRow));
  }

  if (options?.transformRows) {
    data = await options.transformRows(data);
  }

  const response = { data: mapPrimaryKeyToId(data, primaryKey) };

  return response;
};
