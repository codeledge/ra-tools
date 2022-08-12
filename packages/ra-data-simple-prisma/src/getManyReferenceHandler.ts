import { GetManyReferenceRequest, Response } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere } from "./extractWhere";

export type GetManyRefernceArgs = {
  include?: object | null;
  select?: object | null;
};

export type GetManyReferenceOptions<
  Args extends GetManyRefernceArgs = GetManyRefernceArgs
> = {
  debug?: boolean;
  include?: Args["include"];
  select?: Args["select"];
  transform?: (data: any) => any;
};

export const getManyReferenceHandler = async <Args extends GetManyRefernceArgs>(
  req: GetManyReferenceRequest,
  res: Response,
  model: { findMany: Function },
  options?: GetManyReferenceOptions<Args>
) => {
  const { id, target } = req.body.params;

  const orderBy = extractOrderBy(req);

  const where = extractWhere(req);

  const { skip, take } = extractSkipTake(req);

  // GET DATA
  const data = await model.findMany({
    include: options?.include,
    select: options?.select,
    where: { [target]: id, ...where },
    orderBy,
    skip,
    take,
  });

  // TRANSFORM
  await options?.transform?.(data);

  res.json({ data, total: data.length });
};
