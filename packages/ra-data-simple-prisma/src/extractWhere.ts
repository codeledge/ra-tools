import { PlainObject, isObject } from "deverything";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import setObjectProp from "set-value";

const prismaOperators = [
  "contains",
  "endsWith",
  "equals",
  "gt",
  "gte",
  "lt",
  "lte",
  "not",
  "search",
  "startsWith",
];

export type FilterMode = "insensitive" | "default" | undefined;

type ExtractWhereOptions = {
  filterMode?: FilterMode;
};

export const extractWhere = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractWhereOptions
) => {
  const { filter } = req.params;

  const where = {};

  if (filter) {
    Object.entries(filter).forEach(([colName, value]) => {
      if (isNotField(colName)) return;

      //TODO: *consider* to move into `isNotField` (but maybe to reset dates is the only way to do it)
      if (value === "")
        //react-admin does send empty strings in empty filters :(
        return;

      const hasOperator = prismaOperators.some((operator) => {
        if (colName.endsWith(`_${operator}`)) {
          [colName] = colName.split(`_${operator}`);
          setObjectProp(where, colName, { [operator]: value }, { merge: true });
          return true;
        }
      });
      if (hasOperator) return;

      if (
        // Custom operators
        colName.endsWith(`_enum`) ||
        colName.endsWith(`_exact`) ||
        colName.endsWith(`_eq`)
      ) {
        const [cleanColName] = colName.split(/(_enum|_exact|_eq)$/);
        setObjectProp(where, cleanColName, value);
      } else if (colName === "q") {
        // i.e. full-text search, not sure why this has come as a column name?
      } else if (
        colName === "id" ||
        colName === "uuid" ||
        colName === "cuid" ||
        colName.endsWith("_id") ||
        colName.endsWith("Id") ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null // if the client sends null, than that is also a valid (exact) filter!
      ) {
        setObjectProp(where, colName, value);
      } else if (Array.isArray(value)) {
        setObjectProp(where, colName, { in: value });
      } else if (typeof value === "string") {
        setObjectProp(where, colName, {
          contains: value,
          mode: options?.filterMode,
        });
      } else if (isObject(value)) {
        // if object then it's a Json field, this is EXPERIMENTAL and works only for Postgres
        // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filter-on-object-property
        const { path, equals } = formatPrismaPostgresNestedJsonFilter(value);
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

const formatPrismaPostgresNestedJsonFilter = (obj: PlainObject) => {
  const path = Object.keys(obj);
  const val = obj[path[0]];
  let equals;
  if (isObject(val)) {
    const { path: returnedPath, equals: returnedEquals } =
      formatPrismaPostgresNestedJsonFilter(val);
    equals = returnedEquals;
    path.push(...returnedPath);
  } else {
    equals = val;
  }

  return { path, equals };
};
