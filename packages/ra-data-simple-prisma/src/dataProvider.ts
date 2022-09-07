import { DataProvider } from "react-admin";
import { isNumericId } from "./lib/isNumericId";
import axios from "axios";
import type {
  AxiosError,
  AxiosInterceptorOptions,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";

export const dataProvider = (
  endpoint: string,
  options?: {
    headers?: AxiosRequestHeaders;
    resourceToModelMap?: Record<string, string>;
    axiosInterceptors?: {
      response?: {
        onFulfilled?: (value: AxiosResponse<any, any>) => any;
        onRejected?: (error: any) => any;
        options?: AxiosInterceptorOptions;
      }[];
      request?: {
        onFulfilled?: (
          value: AxiosRequestConfig<any>
        ) => AxiosRequestConfig<any> | Promise<AxiosRequestConfig<any>>;
        onRejected?: (error: any) => any;
        options?: AxiosInterceptorOptions;
      }[];
    };
  }
): DataProvider => {
  const apiService = axios.create({
    baseURL: endpoint,
    headers: options.headers,
  });

  apiService.interceptors.response.use((res) => res.data);

  if (options?.axiosInterceptors) {
    if (options.axiosInterceptors.request)
      options.axiosInterceptors.request.forEach((value) =>
        apiService.interceptors.request.use(
          value.onFulfilled,
          value.onRejected,
          value.options
        )
      );

    if (options.axiosInterceptors.response)
      options.axiosInterceptors.response.forEach((value) =>
        apiService.interceptors.response.use(
          value.onFulfilled,
          value.onRejected,
          value.options
        )
      );
  }

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
      castIdToOriginalType(params);

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
      castIdToOriginalType(params);

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
      castIdToOriginalType(params);

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

// https://github.com/marmelab/react-admin/issues/7728#issuecomment-1133959466
// getOne will get the id from url so if the id is number it will be sent as string
const castIdToOriginalType = (params: any) => {
  if (isNumericId(params.id)) params.id = +params.id;
};

// react-admin expects the error to be thrown
// https://marmelab.com/admin-on-rest/RestClients.html#writing-your-own-rest-client
const reactAdminAxiosErrorHandler = (error: AxiosError) => {
  throw error?.response?.data;
};
