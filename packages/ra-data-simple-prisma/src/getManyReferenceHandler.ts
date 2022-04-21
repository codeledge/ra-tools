import { extractSkipTake } from "./extractSkipTake";
import { extractOrderBy } from "./extractOrderBy";
import { GetManyReferenceRequest, GetManyRequest, Response } from "./Http";
import { extractWhere } from "./extractWhere";

export const getManyReferenceHandler = async (
  req: GetManyReferenceRequest,
  res: Response,
  table: { findMany: Function }
) => {
  const { id, target } = req.body.params;

  const orderBy = extractOrderBy(req);

  const where = extractWhere(req);

  const { skip, take } = extractSkipTake(req);

  const list = await table.findMany({
    where: { [target]: id, ...where },
    orderBy,
    skip,
    take,
  });

  res.json({ data: list, total: list.length });
};
