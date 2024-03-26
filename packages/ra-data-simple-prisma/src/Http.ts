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

export type RaPayload<T = string> =
  | GetListRequest<T>
  | GetOneRequest<T>
  | GetManyRequest<T>
  | GetManyReferenceRequest<T>
  | CreateRequest<T>
  | UpdateRequest<T>
  | UpdateManyRequest<T>
  | DeleteRequest<T>
  | DeleteManyRequest<T>;

export type GetListRequest<T = string> = {
  method: "getList";
  params: GetListParams;
  resource: T;
  model?: string;
};

export type GetOneRequest<T = string> = {
  method: "getOne";
  params: GetOneParams;
  resource: T;
  model?: string;
};

export type GetManyRequest<T = string> = {
  method: "getMany";
  params: GetManyParams;
  resource: T;
  model?: string;
};

export type GetManyReferenceRequest<T = string> = {
  method: "getManyReference";
  params: GetManyReferenceParams;
  resource: T;
  model?: string;
};

export type CreateRequest<T = string> = {
  method: "create";
  params: CreateParams;
  resource: T;
  model?: string;
};

export type UpdateRequest<T = string> = {
  method: "update";
  params: UpdateParams;
  resource: T;
  model?: string;
};

export type UpdateManyRequest<T = string> = {
  method: "updateMany";
  params: UpdateManyParams;
  resource: T;
  model?: string;
};

export type DeleteRequest<T = string> = {
  method: "delete";
  params: DeleteParams;
  resource: T;
  model?: string;
};

export type DeleteManyRequest<T = string> = {
  method: "deleteMany";
  params: DeleteManyParams;
  resource: T;
  model?: string;
};
