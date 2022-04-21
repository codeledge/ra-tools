import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { setProperty } from "dot-prop";

export const extractOrderBy = (
  req: GetListRequest | GetManyReferenceRequest
) => {
  const { sort } = req.body.params;

  let orderBy = {};

  if (sort) {
    const { field, order } = sort;
    if (field && order) {
      setProperty(orderBy, field, order.toLowerCase());
    }
  }

  return orderBy;
};
