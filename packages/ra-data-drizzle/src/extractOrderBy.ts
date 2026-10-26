import type { DrizzleOrderBy } from "./DrizzleTypes";
import type { GetListRequest, GetManyReferenceRequest } from "./Http";
import { isNotField } from "./lib/isNotField";

export const extractOrderBy = (
  req: GetListRequest | GetManyReferenceRequest,
): DrizzleOrderBy | undefined => {
  const { sort } = req.params;
  if (!sort) return undefined;

  const { field, order } = sort;
  if (!field || !order || isNotField(field)) return undefined;

  if (field.includes(".")) {
    // RQB v2 object orderBy only supports the table's own columns
    console.info("ra-data-drizzle: Sorting by relation is not supported", field);
    return undefined;
  }

  return { [field]: order.toLowerCase() === "desc" ? "desc" : "asc" };
};
