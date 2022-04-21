import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { setProperty } from "dot-prop";

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
        setProperty(where, colName, value);
      } else if (Array.isArray(value)) {
        setProperty(where, colName, { in: value });
        where[colName] = { in: value };
      } else if (typeof value === "string") {
        setProperty(where, colName, { contains: value });
      }
    });
  }

  return where;
};
