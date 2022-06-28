import {
  CreateParams,
  DeleteManyParams,
  DeleteParams,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  GetOneParams,
  UpdateManyParams,
  UpdateParams,
} from "react-admin";

export type Request =
  | GetListRequest
  | GetOneRequest
  | GetManyRequest
  | GetManyReferenceRequest
  | CreateRequest
  | UpdateRequest
  | UpdateManyRequest
  | DeleteRequest
  | DeleteManyRequest;

export type GetListRequest = {
  body: {
    method: "getList";
    filter: object;
    params: GetListParams;
    resource: string;
    model?: string;
  };
};

export type GetOneRequest = {
  body: {
    method: "getOne";
    params: GetOneParams;
    resource: string;
    model?: string;
  };
};

export type GetManyRequest = {
  body: {
    method: "getMany";
    params: GetManyParams;
    resource: string;
    model?: string;
  };
};

export type GetManyReferenceRequest = {
  body: {
    method: "getManyReference";
    params: GetManyReferenceParams;
    resource: string;
    model?: string;
  };
};

export type CreateRequest = {
  body: {
    method: "create";
    params: CreateParams;
    resource: string;
    model?: string;
  };
};

export type UpdateRequest = {
  body: {
    method: "update";
    params: UpdateParams;
    resource: string;
    model?: string;
  };
};

export type UpdateManyRequest = {
  body: {
    method: "updateMany";
    params: UpdateManyParams;
    resource: string;
    model?: string;
  };
};

export type DeleteRequest = {
  body: {
    method: "delete";
    params: DeleteParams;
    resource: string;
    model?: string;
  };
};

export type DeleteManyRequest = {
  body: {
    method: "deleteMany";
    params: DeleteManyParams;
    resource: string;
    model?: string;
  };
};

declare type Send<T> = (body: T) => void;

export type Response<T extends { data: any } = any> = {
  json: Send<T>;
};
