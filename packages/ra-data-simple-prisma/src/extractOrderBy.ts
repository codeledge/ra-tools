import { GetListRequest, GetManyReferenceRequest } from "./Http";
import setObjectProp from "set-value";

export const extractOrderBy = (
  req: GetListRequest | GetManyReferenceRequest
) => {
  const { sort } = req.body.params;

  let orderBy = {};

  if (sort) {
    const { field, order } = sort;
    if (field && order) {
      setObjectProp(orderBy, field, order.toLowerCase());
    }
  }

  return orderBy;
};
