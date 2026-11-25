import { PlainObject, isArray, isObject, isString } from "deverything";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";
import { assertSafePathSegment, setSafePath } from "./lib/safePath";
import { RDSPError } from "./RDSPError";

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

const LOGICAL_OPERATORS = new Set(["AND", "OR", "NOT"]);

// Relation filters: their value is a where object on the related model.
const RELATION_OPERATORS = new Set(["some", "every", "none", "is", "isNot"]);

// Scalar/list/json filters: their value applies to the field they sit on.
const FIELD_OPERATORS = new Set([
  "equals",
  "in",
  "notIn",
  "lt",
  "lte",
  "gt",
  "gte",
  "contains",
  "startsWith",
  "endsWith",
  "mode",
  "not",
  "search",
  "has",
  "hasEvery",
  "hasSome",
  "isEmpty",
  "isSet",
  "path",
  "string_contains",
  "string_starts_with",
  "string_ends_with",
  "array_contains",
  "array_starts_with",
  "array_ends_with",
]);

export type FilterMode = "insensitive" | "default" | undefined;

export type ExtractWhereOptions = {
  filterMode?: FilterMode;
  debug?: boolean;
  /**
   * Field paths the client may filter on, e.g. `["title", "author.name"]`.
   * When set, any filter touching another field is rejected with an
   * RDSPError, including fields referenced inside raw `OR`/`AND`/`NOT`
   * filters. When unset, every field of the model is filterable.
   */
  filterableFields?: string[];
};

const CONTEXT = "extractWhere";

export const extractWhere = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractWhereOptions,
) => {
  const { filter } = req.params;

  const where = {};

  const allowedFields = options?.filterableFields
    ? new Set(options.filterableFields)
    : undefined;

  const assertFilterable = (fieldPath: string) => {
    if (allowedFields && !allowedFields.has(fieldPath)) {
      throw new RDSPError(`${CONTEXT}: filtering on "${fieldPath}" is not allowed`);
    }
  };

  const joinPath = (base: string | undefined, segment: string) =>
    base ? `${base}.${segment}` : segment;

  // Walks a raw Prisma where fragment (sent verbatim by the client, e.g. inside
  // OR/AND/NOT) to reject unsafe keys and fields outside the allowlist.
  const validateRawWhere = (value: unknown, fieldPath: string | undefined) => {
    if (isArray(value)) {
      value.forEach((item) => validateRawWhere(item, fieldPath));
      return;
    }
    if (!isObject(value)) {
      if (fieldPath) assertFilterable(fieldPath);
      return;
    }

    const entries = Object.entries(value);
    if (!entries.length && fieldPath) assertFilterable(fieldPath);

    entries.forEach(([key, nested]) => {
      assertSafePathSegment(key, CONTEXT);
      if (LOGICAL_OPERATORS.has(key) || RELATION_OPERATORS.has(key)) {
        validateRawWhere(nested, fieldPath);
      } else if (FIELD_OPERATORS.has(key)) {
        if (!fieldPath) {
          throw new RDSPError(`${CONTEXT}: operator "${key}" needs a field`);
        }
        assertFilterable(fieldPath);
        if (key === "not" && isObject(nested)) validateRawWhere(nested, fieldPath);
      } else {
        validateRawWhere(nested, joinPath(fieldPath, key));
      }
    });
  };

  const setWhere = (filter: PlainObject, currentFilterPath?: string) => {
    Object.entries(filter).forEach(([field, value]) => {
      if (isNotField(field)) return;

      //TODO: *consider* to move into `isNotField` (but maybe to reset dates is the only way to do it)
      if (value === "")
        //react-admin does send empty strings in empty filters :(
        return;

      const filterPath = joinPath(currentFilterPath, field);

      const hasPrismaOperator = prismaOperators.some((operator) => {
        if (field.endsWith(`_${operator}`)) {
          const [wherePath] = filterPath.split(`_${operator}`);
          if (LOGICAL_OPERATORS.has(operator)) {
            validateRawWhere(value, wherePath);
          } else {
            assertFilterable(wherePath);
            if (isObject(value) || isArray(value)) {
              validateRawWhere({ [operator]: value }, wherePath);
            }
          }
          setSafePath(where, wherePath + `.${operator}`, value, CONTEXT);
          return true;
        }
      });

      if (hasPrismaOperator) return;

      if (
        // Custom operators
        field.endsWith(`_enum`) ||
        field.endsWith(`_exact`) ||
        field.endsWith(`_eq`)
      ) {
        const [wherePath] = filterPath.split(/(_enum|_exact|_eq)$/);
        assertFilterable(wherePath);
        if (isObject(value)) validateRawWhere(value, wherePath);
        setSafePath(where, wherePath, value, CONTEXT);
      } else if (field.endsWith(`_pgjson`)) {
        const [wherePath] = filterPath.split("_pgjson");

        // if object then it's a Json field, this is EXPERIMENTAL and works only for Postgres
        // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filter-on-object-property
        const { path, equals } = formatPrismaPostgresNestedJsonFilter(value);
        if (path.length && equals) {
          assertFilterable(wherePath);
          setSafePath(where, wherePath, { path, equals }, CONTEXT); // TODO: allow operators
        }
      } else if (field.endsWith(`_trueOnly`)) {
        const [wherePath] = filterPath.split("_trueOnly");
        if (value === true) {
          assertFilterable(wherePath);
          setSafePath(where, wherePath, true, CONTEXT);
        }
        // else, ignore the filter
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
        assertFilterable(filterPath);
        if (isObject(value) || isArray(value)) validateRawWhere(value, filterPath);
        setSafePath(where, filterPath, value, CONTEXT);
      } else if (LOGICAL_OPERATORS.has(field)) {
        if (isArray(value) && value.every((item) => isObject(item))) {
          validateRawWhere(value, currentFilterPath);
          setSafePath(where, filterPath, value, CONTEXT);
        }
      } else if (isArray(value)) {
        assertFilterable(filterPath);
        setSafePath(where, filterPath, { in: value }, CONTEXT);
      } else if (isString(value)) {
        assertFilterable(filterPath);
        setSafePath(
          where,
          filterPath,
          {
            contains: value,
            mode: options?.filterMode,
          },
          CONTEXT,
        );
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
