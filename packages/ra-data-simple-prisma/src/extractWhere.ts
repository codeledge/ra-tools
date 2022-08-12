import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import { isObject } from "./lib/isObject";
import setObjectProp from "set-value";

const logicalOperators = ["gte", "lte", "lt", "gt"];

export const extractWhere = (req: GetListRequest | GetManyReferenceRequest) => {
  const { filter } = req.body.params;

  const where = {};

  if (filter) {
    Object.entries(filter).forEach(([colName, value]) => {
      if (isNotField(colName)) return;

      //TODO: *consider* to move into `isNotField` (but maybe to reset dates is the only way to do it)
      if (value === "")
        //react-admin does send empty strings in empty filters :(
        return;

      const hasOperator = logicalOperators.some((operator) => {
        if (colName.endsWith(`_${operator}`)) {
          [colName] = colName.split(`_${operator}`);
          setObjectProp(where, colName, { [operator]: value }, { merge: true });
          return true;
        }
      });
      if (hasOperator) return;

      if (colName === "q") {
        //WHAT THE HECK IS q?
      } else if (
        colName === "id" ||
        colName === "uuid" ||
        colName === "cuid" ||
        colName.endsWith("_id") ||
        colName.endsWith("Id") ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        setObjectProp(where, colName, value);
      } else if (Array.isArray(value)) {
        setObjectProp(where, colName, { in: value });
      } else if (typeof value === "string") {
        setObjectProp(where, colName, { contains: value});
      } else if (isObject(value)) {
        // if object then it's a Json field, this is EXPERIMENTAL and works only for Postgres
        // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filter-on-object-property
        const { path, equals } = getPostgresJsonFilter(value);
        if (path.length && equals) {
          setObjectProp(where, colName, { path, equals });
        }
      } else {
        console.info("Filter not handled:", colName, value);
      }
    });
  }

  return where;
};

const getPostgresJsonFilter = (obj: any) => {
  const path = Object.keys(obj);
  const val = obj[path[0]];
  let equals;
  if (isObject(val)) {
    const { path: returnedPath, equals: returnedEquals } = getPostgresJsonFilter(val);
    equals = returnedEquals;
    path.push(...returnedPath);
  } else {
    equals = val;
  }

  return { path, equals };
};
