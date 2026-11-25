import { isPositiveInt } from "deverything";
import { GetListRequest, GetManyReferenceRequest } from "./Http";
import { RDSPError } from "./RDSPError";

export const DEFAULT_MAX_PER_PAGE = 1000; // react-admin's default export size

export type ExtractSkipTakeOptions = {
  /**
   * Largest `perPage` a client may request. Defaults to 1000, which is what
   * react-admin's ExportButton asks for by default.
   */
  maxPerPage?: number;
};

/**
 * Turns react-admin pagination into Prisma `skip`/`take`. Returns undefined
 * values when the request has no pagination; use `extractRequiredSkipTake`
 * to refuse such requests instead.
 * Throws an RDSPError when page/perPage aren't positive integers or perPage
 * exceeds `maxPerPage`.
 */
export const extractSkipTake = (
  req: GetListRequest | GetManyReferenceRequest,
  options?: ExtractSkipTakeOptions,
): { skip: number | undefined; take: number | undefined } => {
  const { pagination } = req.params;

  let skip: number | undefined;
  let take: number | undefined;

  if (pagination) {
    const { page, perPage } = pagination;
    const maxPerPage = options?.maxPerPage ?? DEFAULT_MAX_PER_PAGE;

    if (!isPositiveInt(page) || !isPositiveInt(perPage)) {
      throw new RDSPError(
        "extractSkipTake: pagination page and perPage must be positive integers",
      );
    }
    if (perPage > maxPerPage) {
      throw new RDSPError(
        `extractSkipTake: perPage ${perPage} exceeds the maximum of ${maxPerPage}`,
      );
    }

    skip = (page - 1) * perPage;
    take = perPage;
  }

  return { skip, take };
};
