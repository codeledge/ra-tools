import { GetManyReferenceRequest } from "./Http";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";
import { getModel } from "./getModel";

export type GetManyRefernceArgs = {
  include?: object | null;
  select?: object | null;
};

export type GetManyReferenceOptions<
  Args extends GetManyRefernceArgs = GetManyRefernceArgs
> = Args & {
  debug?: boolean;
  transformRow?: (data: any) => any | Promise<any>;
  filterMode?: FilterMode;
};

export const getManyReferenceHandler = async <Args extends GetManyRefernceArgs>(
  req: GetManyReferenceRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: GetManyReferenceOptions<Args>
) => {
  const { id, target } = req.params;
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

  const response = { data, total };

  return response;
};
