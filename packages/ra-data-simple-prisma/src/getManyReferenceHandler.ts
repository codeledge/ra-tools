import { GetManyReferenceRequest, Response } from "./Http";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere } from "./extractWhere";

export const getManyReferenceHandler = async (
  req: GetManyReferenceRequest,
  res: Response,
  model: { findMany: Function }
) => {
  const { id, target } = req.body.params;

  const orderBy = extractOrderBy(req);

  const where = extractWhere(req);

  const { skip, take } = extractSkipTake(req);

  // GET DATA
  const data = await model.findMany({
    where: { [target]: id, ...where },
    orderBy,
    skip,
    take,
  });

  res.json({ data, total: data.length });
};
