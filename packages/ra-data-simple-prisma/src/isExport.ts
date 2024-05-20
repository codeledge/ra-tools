import { GetListRequest } from "./Http";

export const isExport = (req: GetListRequest): boolean => {
  const { pagination } = req.params;

  if (pagination) {
    const { page, perPage } = pagination;

    if (page === 1 && perPage === 1000) return true;
  }

  return false;
};
