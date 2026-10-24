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
};

export type GetOneRequest<T = string> = {
  method: "getOne";
  params: GetOneParams;
  resource: T;
};

export type GetManyRequest<T = string> = {
  method: "getMany";
  params: GetManyParams;
  resource: T;
};

export type GetManyReferenceRequest<T = string> = {
  method: "getManyReference";
  params: GetManyReferenceParams;
  resource: T;
};

export type CreateRequest<T = string> = {
  method: "create";
  params: CreateParams;
  resource: T;
};

export type UpdateRequest<T = string> = {
  method: "update";
  params: UpdateParams;
  resource: T;
};

export type UpdateManyRequest<T = string> = {
  method: "updateMany";
  params: UpdateManyParams;
  resource: T;
};

export type DeleteRequest<T = string> = {
  method: "delete";
  params: DeleteParams;
  resource: T;
};

export type DeleteManyRequest<T = string> = {
  method: "deleteMany";
  params: DeleteManyParams;
  resource: T;
};
