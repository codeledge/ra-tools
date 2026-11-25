import { ExtractSkipTakeOptions, extractSkipTake } from "./extractSkipTake";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { RDSPError } from "./RDSPError";

/**
 * Extracts the skip and take values from the request.
 * Throws an RDSPError if pagination is missing or invalid, so a list query is
 * never unbounded. The list handlers use this.
 */
export const extractRequiredSkipTake = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractSkipTakeOptions,
): { skip: number; take: number } => {
  const { pagination } = req.params;

  if (!pagination) {
    throw new RDSPError("extractRequiredSkipTake: pagination is required");
  }

  return extractSkipTake(req, options) as { skip: number; take: number };
};
