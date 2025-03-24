import { GetListRequest } from "./Http";

export const isExport = (getListRequest: GetListRequest): boolean => {
  // Keep ? in case getListRequest is not a GetListRequest or not even defined
  const pagination = getListRequest?.params?.pagination;

  if (pagination) {
    const { page, perPage } = pagination;

    if (page === 1 && perPage === 1000) return true;
  }

  return false;
};
