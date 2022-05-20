import { DataProvider } from "react-admin";
import axios, { AxiosError } from "axios";

export const dataProvider = (
  endpoint: string,
  options?: {
    resourceToModelMap?: Record<string, string>;
  }
): DataProvider => {
  const apiService = axios.create({
    baseURL: endpoint,
  });

  apiService.interceptors.response.use((res) => res.data);

  return {
    getList: (resource, params) => {
      return apiService
        .post(resource, {
          method: "getList",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    getOne: (resource, params) => {
      return apiService
        .post(resource, {
          method: "getOne",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    getMany: (resource, params) => {
      return apiService
        .post(resource, {
          method: "getMany",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    getManyReference: (resource, params) => {
      return apiService
        .post(resource, {
          method: "getManyReference",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    create: (resource, params) => {
      return apiService
        .post(resource, {
          method: "create",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    update: (resource, params) => {
      return apiService
        .post(resource, {
          method: "update",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    updateMany: (resource, params) => {
      return apiService
        .post(resource, {
          method: "updateMany",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    delete: (resource, params) => {
      return apiService
        .post(resource, {
          method: "delete",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
    deleteMany: (resource, params) => {
      return apiService
        .post(resource, {
          method: "deleteMany",
          resource,
          params,
          model: options?.resourceToModelMap?.[resource] ?? undefined,
        })
        .catch(reactAdminAxiosErrorHandler);
    },
  };
};

// react-admin expects the error to be thrown
// https://marmelab.com/admin-on-rest/RestClients.html#writing-your-own-rest-client
const reactAdminAxiosErrorHandler = (error: AxiosError) => {
  throw error.response.data;
};
