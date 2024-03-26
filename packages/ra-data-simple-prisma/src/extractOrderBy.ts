import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { setObjectPath } from "deverything";

export const extractOrderBy = (
  req: GetListRequest | GetManyReferenceRequest
) => {
  const { sort } = req.params;

  let orderBy = {};

  if (sort) {
    const { field, order } = sort;
    // TODO: use isField() or you will sort underscore fields
    if (field && order) {
      setObjectPath(orderBy, field, order.toLowerCase());
    }
  }

  return orderBy;
};
