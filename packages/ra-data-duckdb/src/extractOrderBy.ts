import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";

export const extractOrderBy = (
  req: GetListRequest | GetManyReferenceRequest,
  primaryKey = "id",
): string => {
  const { sort } = req.params;

  if (sort?.field && sort?.order) {
    const field = sort.field === "id" ? primaryKey : sort.field;
    const direction = sort.order.toUpperCase() === "DESC" ? "DESC" : "ASC";
    return `ORDER BY ${quoteIdent(field)} ${direction}`;
  }

  return "";
};
