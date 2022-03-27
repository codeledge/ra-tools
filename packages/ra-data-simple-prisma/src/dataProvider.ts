import { DataProvider } from "react-admin";
import axios from "axios";

const dataProvider = (
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
      console.log({ params });
      return apiService.post(resource, {
        action: "getList",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    getOne: (resource, params) => {
      return apiService.post(resource, {
        action: "getOne",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    getMany: (resource, params) => {
      return apiService.post(resource, {
        action: "getMany",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    getManyReference: (resource, params) => {
      return apiService.post(resource, {
        action: "getManyReference",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    create: (resource, params) => {
      return apiService.post(resource, {
        action: "create",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    update: (resource, params) => {
      return apiService.post(resource, {
        action: "update",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    updateMany: (resource, params) => {
      return apiService.post(resource, {
        action: "updateMany",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    delete: (resource, params) => {
      return apiService.post(resource, {
        action: "delete",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
    deleteMany: (resource, params) => {
      return apiService.post(resource, {
        action: "deleteMany",
        resource,
        params,
        model: options?.resourceToModelMap?.[resource] ?? undefined,
      });
    },
  };
};

export default dataProvider;
