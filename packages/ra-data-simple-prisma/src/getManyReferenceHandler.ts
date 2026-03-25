import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";
import { getModel } from "./getModel";
import { GetManyReferenceRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type GetManyReferenceArgs = {
  include?: object | null;
  select?: object | null;
  omit?: object | null;
};

export type GetManyReferenceOptions<
  Args extends GetManyReferenceArgs = GetManyReferenceArgs
> = Args & {
  debug?: boolean;
  primaryKey?: string;
  transformRow?: (data: any) => any | Promise<any>;
  filterMode?: FilterMode;
};

export const getManyReferenceHandler = async <
  Args extends GetManyReferenceArgs
>(
  req: GetManyReferenceRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: GetManyReferenceOptions<Args>,
) => {
  const { id, target } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const model = getModel(req, prismaClient);
  const orderBy = extractOrderBy(req);

  const where = extractWhere(req, {
    filterMode: options?.filterMode,
  });

  const { skip, take } = extractSkipTake(req);

  // GET DATA

  const [rows, total] = await Promise.all([
    model.findMany({
      include: options?.include,
      select: options?.select,
      omit: options?.omit,
      where: { [target]: id, ...where },
      orderBy,
      skip,
      take,
    }),
    model.count({ where: { [target]: id, ...where } }),
  ]);

  // TRANSFORM
  const data = options?.transformRow
    ? await Promise.all(rows.map(options.transformRow))
    : rows;

  const response = { data: mapPrimaryKeyToId(data, primaryKey), total };

  return response;
};
