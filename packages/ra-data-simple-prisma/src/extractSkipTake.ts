import { GetListRequest, GetManyReferenceRequest } from "./Http";

export const extractSkipTake = (
  req: GetListRequest | GetManyReferenceRequest
) => {
  const { pagination } = req.body.params;

  let skip;
  let take;

  if (pagination) {
    const { page, perPage } = pagination;

    const first = (page - 1) * perPage;
    const last = page * perPage - 1;

    if (first === 0 && last === 999) {
      // Do nothing: when exporting, the free version only allows 1000 records
    } else {
      skip = first;
      take = last - first + 1;
    }
  }

  return { skip, take };
};
