import { DataProvider } from "react-admin";
import axios from "axios";

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
      return apiService.post(resource, {
        method: "getList",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    getOne: (resource, params) => {
      return apiService.post(resource, {
        method: "getOne",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    getMany: (resource, params) => {
      return apiService.post(resource, {
        method: "getMany",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    getManyReference: (resource, params) => {
      return apiService.post(resource, {
        method: "getManyReference",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    create: (resource, params) => {
      return apiService.post(resource, {
        method: "create",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    update: (resource, params) => {
      return apiService.post(resource, {
        method: "update",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    updateMany: (resource, params) => {
      return apiService.post(resource, {
        method: "updateMany",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    delete: (resource, params) => {
      return apiService.post(resource, {
        method: "delete",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    deleteMany: (resource, params) => {
      return apiService.post(resource, {
        method: "deleteMany",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
  };
};
