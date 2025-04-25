import { GetManyReferenceRequest } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";

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
  model: { findMany: Function; count: Function },
  options?: GetManyReferenceOptions<Args>
) => {
  const { id, target } = req.params;

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
