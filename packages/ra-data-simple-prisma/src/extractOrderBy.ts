import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { setSafePath } from "./lib/safePath";
import { RDSPError } from "./RDSPError";

export type ExtractOrderByOptions = {
  /**
   * Field paths the client may sort on, e.g. `["id", "createdAt", "author.name"]`.
   * When set, sorting on any other field is rejected with an RDSPError.
   * When unset, every field of the model is sortable.
   */
  sortableFields?: string[];
};

const CONTEXT = "extractOrderBy";

export const extractOrderBy = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractOrderByOptions,
) => {
  const { sort } = req.params;

  let orderBy = {};

  if (sort) {
    const { field, order } = sort;
    // TODO: use isField() or you will sort underscore fields
    if (field && order) {
      const direction = String(order).toLowerCase();
      if (direction !== "asc" && direction !== "desc") {
        throw new RDSPError(`${CONTEXT}: invalid sort order "${String(order)}"`);
      }
      if (options?.sortableFields && !options.sortableFields.includes(field)) {
        throw new RDSPError(`${CONTEXT}: sorting on "${field}" is not allowed`);
      }
      setSafePath(orderBy, field, direction, CONTEXT);
    }
  }

  return orderBy;
};
