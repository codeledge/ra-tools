import { GetListRequest } from "./Http";
import { setProperty } from "dot-prop";

export const extractGetListOrderBy = (req: GetListRequest) => {
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
