import { PlainObject, isObject, setObjectPath } from "deverything";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";

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

  const handleFilter = (filterObject: any, parentKey?: string) => {
    Object.entries(filterObject).forEach(([key, value]) => {
      const colName = parentKey ? `${parentKey}.${key}` : key;

      if (isNotField(colName)) return;

      if (value === "") return; // Ignore empty values

      const hasOperator = prismaOperators.some((operator) => {
        if (colName.endsWith(`_${operator}`)) {
          const [cleanColName] = colName.split(`_${operator}`);
          setObjectPath(where, cleanColName, { [operator]: value });
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
        setObjectPath(where, cleanColName, value);
      } else if (colName === "q") {
        // i.e. when filterToQuery is not set on AutoCompleteInput, but we don't know all the fields to search against
        console.info("Filter not handled:", colName, value);
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
        setObjectPath(where, colName, value);
      } else if (Array.isArray(value)) {
        setObjectPath(where, colName, { in: value });
      } else if (typeof value === "string") {
        setObjectPath(where, colName, {
          contains: value,
          mode: options?.filterMode,
        });
      } else if (isObject(value)) {
        handleFilter(value, colName); // Recursively handle nested objects
      }
    });
  };

  if (filter) {
    handleFilter(filter);
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
