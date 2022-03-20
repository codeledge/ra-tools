import { DataProvider } from "react-admin";
import axios from "axios";

export const dataProvider: ({
  endpoint,
  resourceMap,
}: {
  endpoint: string;
  resourceMap?: Record<string, string>;
}) => DataProvider = ({ endpoint, resourceMap }) => {
  const apiService = axios.create({
    baseURL: endpoint,
  });

  apiService.interceptors.response.use((res) => res.data);

  const getTableName = (resourceName: string) => {
    return resourceMap?.[resourceName] ?? resourceName;
  };

  return {
    getList: (resource, params) => {
      return apiService.post("", {
        action: "getList",
        resource: getTableName(resource),
        params,
      });
    },
    create: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
    deleteMany: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
    getOne: (resource, params) => {
      return apiService.post("", {
        action: "getOne",
        resource: getTableName(resource),
        params,
      });
    },
    getMany: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
    getManyReference: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
    updateMany: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
    update: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
    delete: (resource, params) => {
      return Promise.reject(new Error("Not implemented"));
    },
  };
};
