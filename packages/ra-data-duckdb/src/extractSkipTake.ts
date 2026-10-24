import { GetListRequest, GetManyReferenceRequest } from "./Http";

export const extractSkipTake = (
  req: GetListRequest | GetManyReferenceRequest,
): { skip: number | undefined; take: number | undefined } => {
  const { pagination } = req.params;

  let skip: number | undefined;
  let take: number | undefined;

  if (pagination) {
    const { page, perPage } = pagination;

    const first = (page - 1) * perPage;
    const last = page * perPage - 1;

    skip = first;
    take = last - first + 1;
  }

  return { skip, take };
};
