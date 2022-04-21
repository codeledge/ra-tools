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

export type SortRequest = { field: string; order: "ASC" | "DESC" };

export type PaginationRequest = { page: number; perPage: number };

export type GetListRequest = {
  body: {
    method: "getList";
    filter: object;
    params: {
      pagination: PaginationRequest;
      sort: SortRequest;
      filter: object;
    };
    resource: string;
    model?: string;
  };
};

export type GetOneRequest = {
  body: {
    method: "getOne";
    params: {
      id: any;
    };
    resource: string;
    model?: string;
  };
};

export type GetManyRequest = {
  body: {
    method: "getMany";
    params: {
      ids: any[];
    };
    resource: string;
    model?: string;
  };
};

export type GetManyReferenceRequest = {
  body: {
    method: "getManyReference";
    params: {
      target: string;
      id: any;
      pagination: PaginationRequest;
      sort: SortRequest;
      filter: object;
    };
    resource: string;
    model?: string;
  };
};

export type CreateRequest = {
  body: {
    method: "create";
    params: {
      data: Record<string, any>;
    };
    resource: string;
    model?: string;
  };
};

export type UpdateRequest = {
  body: {
    method: "update";
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
    method: "updateMany";
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
    method: "delete";
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
    method: "deleteMany";
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
