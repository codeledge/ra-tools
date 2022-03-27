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
    action: "getList";
    filter: object;
    params: {
      pagination: { page: number; perPage: number };
      sort: { field: string; order: "ASC" | "DESC" };
      filter: object;
    };
    resource: string;
    model?: string;
  };
};

export type GetOneRequest = {
  body: {
    action: "getOne";
    params: {
      id: any;
    };
    resource: string;
    model?: string;
  };
};

export type GetManyRequest = {
  body: {
    action: "getMany";
    params: {
      ids: any[];
    };
    resource: string;
    model?: string;
  };
};

export type GetManyReferenceRequest = {
  body: {
    action: "getManyReference";
    params: {
      target: string;
      id: any;
      pagination: { page: number; perPage: number };
      sort: { field: string; order: "ASC" | "DESC" };
      filter: object;
    };
    resource: string;
    model?: string;
  };
};

export type CreateRequest = {
  body: {
    action: "create";
    params: {
      data: object;
    };
    resource: string;
    model?: string;
  };
};

export type UpdateRequest = {
  body: {
    action: "update";
    params: {
      id: any;
      data: object;
      previousData: object;
    };
    resource: string;
    model?: string;
  };
};

export type UpdateManyRequest = {
  body: {
    action: "updateMany";
    params: {
      ids: any[];
      data: object;
    };
    resource: string;
    model?: string;
  };
};

export type DeleteRequest = {
  body: {
    action: "delete";
    params: {
      id: any;
      previousData: object;
    };
    resource: string;
    model?: string;
  };
};

export type DeleteManyRequest = {
  body: {
    action: "deleteMany";
    params: {
      ids: any[];
    };
    resource: string;
    model?: string;
  };
};

declare type Send<T> = (body: T) => void;

export type Response<T extends { data: any } = any> = {
  json: Send<T>;
};
