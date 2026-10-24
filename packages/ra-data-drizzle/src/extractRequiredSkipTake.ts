import { extractSkipTake } from "./extractSkipTake";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { RDDError } from "./RDDError";

/**
 * Extracts the skip and take values from the request.
 * Throws an error if pagination is not present.
 * This is useful if the server depends on the pagination being present.
 */
export const extractRequiredSkipTake = (
  req: GetListRequest | GetManyReferenceRequest,
): { skip: number; take: number } => {
  const { pagination } = req.params;

  if (!pagination) {
    throw new RDDError("extractRquiredSkipTake: pagination is required");
  }

  return extractSkipTake(req);
};
