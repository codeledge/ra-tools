import {
  PlainObject,
  isArray,
  isObject,
  isString,
  setObjectPath,
} from "deverything";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";

const prismaOperators = [
  "contains",
  "endsWith",
  "equals",
  "gt",
  "gte",
  "has",
  "in",
  "lt",
  "lte",
  "not",
  "search",
  "startsWith",
  "AND",
  "OR",
  "NOT",
];

export type FilterMode = "insensitive" | "default" | undefined;

export type ExtractWhereOptions = {
  filterMode?: FilterMode;
  debug?: boolean;
};

export const extractWhere = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractWhereOptions
) => {
  const { filter } = req.params;

  const where = {};

  const setWhere = (filter: PlainObject, currentFilterPath?: string) => {
    Object.entries(filter).forEach(([field, value]) => {
      if (isNotField(field)) return;

      //TODO: *consider* to move into `isNotField` (but maybe to reset dates is the only way to do it)
      if (value === "")
        //react-admin does send empty strings in empty filters :(
        return;

      const filterPath = currentFilterPath
        ? `${currentFilterPath}.${field}`
        : field;

      const hasOperator = prismaOperators.some((operator) => {
        if (field.endsWith(`_${operator}`)) {
          const [wherePath] = filterPath.split(`_${operator}`);
          setObjectPath(where, wherePath + `.${operator}`, value);
          return true;
        }
      });
      if (hasOperator) return;

      if (
        // Custom operators
        field.endsWith(`_enum`) ||
        field.endsWith(`_exact`) ||
        field.endsWith(`_eq`)
      ) {
        const [wherePath] = filterPath.split(/(_enum|_exact|_eq)$/);
        setObjectPath(where, wherePath, value);
      } else if (field.endsWith(`_pgjson`)) {
        const [wherePath] = filterPath.split("_pgjson");

        // if object then it's a Json field, this is EXPERIMENTAL and works only for Postgres
        // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filter-on-object-property
        const { path, equals } = formatPrismaPostgresNestedJsonFilter(value);
        if (path.length && equals) {
          setObjectPath(where, wherePath, { path, equals }); // TODO: allow operators
        }
      } else if (field === "q") {
        // i.e. when filterToQuery is not set on AutoCompleteInput, but we don't know all the fields to search against
        console.info("Filter not handled:", field, value);
      } else if (
        field === "id" || // careful not to use filterPath here
        field === "uuid" ||
        field === "uid" ||
        field === "cuid" ||
        field.endsWith("_id") ||
        field.endsWith("_uuid") ||
        field.endsWith("_uid") ||
        field.endsWith("_cuid") ||
        field.endsWith("Id") ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null // if the client sends null, than that is also a valid (exact) filter!
      ) {
        setObjectPath(where, filterPath, value);
      } else if (["OR", "AND", "NOT"].includes(field)) {
        if (isArray(value) && value.every((item) => isObject(item))) {
          setObjectPath(where, filterPath, value);
        }
      } else if (isArray(value)) {
        setObjectPath(where, filterPath, { in: value });
      } else if (isString(value)) {
        setObjectPath(where, filterPath, {
          contains: value,
          mode: options?.filterMode,
        });
      } else if (isObject(value)) {
        setWhere(value, filterPath); // Recursively handle nested objects
      } else {
        console.info("ra-data-simple-prisma: Filter not handled", field, value);
      }
    });
  };

  if (filter) {
    setWhere(filter);
  }

  if (options?.debug) console.debug("extractWhere:where", where);

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
