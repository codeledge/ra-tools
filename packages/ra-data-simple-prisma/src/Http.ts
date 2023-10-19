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

export type RaPayload =
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
  method: "getList";
  params: GetListParams;
  resource: string;
  model?: string;
};

export type GetOneRequest = {
  method: "getOne";
  params: GetOneParams;
  resource: string;
  model?: string;
};

export type GetManyRequest = {
  method: "getMany";
  params: GetManyParams;
  resource: string;
  model?: string;
};

export type GetManyReferenceRequest = {
  method: "getManyReference";
  params: GetManyReferenceParams;
  resource: string;
  model?: string;
};

export type CreateRequest = {
  method: "create";
  params: CreateParams;
  resource: string;
  model?: string;
};

export type UpdateRequest = {
  method: "update";
  params: UpdateParams;
  resource: string;
  model?: string;
};

export type UpdateManyRequest = {
  method: "updateMany";
  params: UpdateManyParams;
  resource: string;
  model?: string;
};

export type DeleteRequest = {
  method: "delete";
  params: DeleteParams;
  resource: string;
  model?: string;
};

export type DeleteManyRequest = {
  method: "deleteMany";
  params: DeleteManyParams;
  resource: string;
  model?: string;
};
