import { GetListRequest, GetManyReferenceRequest } from "./Http";
import setObjectProp from "set-value";

export const extractWhere = (req: GetListRequest | GetManyReferenceRequest) => {
  const { filter } = req.body.params;

  const where = {};

  if (filter) {
    Object.entries(filter).forEach(([colName, value]) => {
      //ignore underscored fields (_count, _sum, _avg, _min, _max and _helpers)
      if (colName.startsWith("_")) return;

      if (colName === "q") {
        //WHAT THE HECK IS q?
      } else if (
        colName === "id" ||
        colName === "uuid" ||
        colName === "cuid" ||
        colName.endsWith("_id") ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        setObjectProp(where, colName, value);
      } else if (Array.isArray(value)) {
        setObjectProp(where, colName, { in: value });
        where[colName] = { in: value };
      } else if (typeof value === "string") {
        setObjectProp(where, colName, { contains: value });
      }
    });
  }

  return where;
};
