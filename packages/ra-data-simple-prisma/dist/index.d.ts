import { DataProvider } from 'react-admin';
import { PrismaClient } from '@prisma/client';

declare type Request = GetListRequest | GetOneRequest | GetManyRequest | GetManyReferenceRequest | CreateRequest | UpdateRequest | UpdateManyRequest | DeleteRequest | DeleteManyRequest;
declare type SortRequest = {
    field: string;
    order: "ASC" | "DESC";
};
declare type PaginationRequest = {
    page: number;
    perPage: number;
};
declare type GetListRequest = {
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
declare type GetOneRequest = {
    body: {
        method: "getOne";
        params: {
            id: any;
        };
        resource: string;
        model?: string;
    };
};
declare type GetManyRequest = {
    body: {
        method: "getMany";
        params: {
            ids: any[];
        };
        resource: string;
        model?: string;
    };
};
declare type GetManyReferenceRequest = {
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
declare type CreateRequest = {
    body: {
        method: "create";
        params: {
            data: Record<string, any>;
        };
        resource: string;
        model?: string;
    };
};
declare type UpdateRequest = {
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
declare type UpdateManyRequest = {
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
declare type DeleteRequest = {
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
declare type DeleteManyRequest = {
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
declare type Response<T extends {
    data: any;
} = any> = {
    json: Send<T>;
};

declare const createHandler: <T extends {
    create: Function;
}>(req: CreateRequest, res: Response, table: T, options?: {
    connect?: {
        [key: string]: string;
    };
}) => Promise<void>;

declare const dataProvider: (endpoint: string, options?: {
    resourceToModelMap?: Record<string, string>;
}) => DataProvider;

declare type UpdateOptions = {
    skipFields?: string[];
    allowFields?: string[];
};
declare const updateHandler: <T extends {
    update: Function;
}>(req: UpdateRequest, res: Response, table: T, options?: UpdateOptions) => Promise<void>;

declare type DeleteOptions = {
    softDeleteField?: string;
};
declare const deleteHandler: <T extends {
    update: Function;
    delete: Function;
}>(req: DeleteRequest, res: Response, table: T, options?: DeleteOptions) => Promise<void>;

declare const defaultHandler: (req: Request, res: Response, prisma: PrismaClient, options?: {
    delete?: DeleteOptions;
    update?: UpdateOptions;
}) => Promise<void>;

declare type DeleteManyOptions = {
    softDeleteField?: string;
};
declare const deleteManyHandler: <T extends {
    updateMany: Function;
    deleteMany: Function;
}>(req: DeleteManyRequest, res: Response, table: T, options?: DeleteManyOptions) => Promise<void>;

declare const extractOrderBy: (req: GetListRequest | GetManyReferenceRequest) => {};

declare const extractSkipTake: (req: GetListRequest | GetManyReferenceRequest) => {
    skip: any;
    take: any;
};

declare const extractWhere: (req: GetListRequest | GetManyReferenceRequest) => {};

declare const getListHandler: <W extends {
    include?: object | null;
    orderBy?: object | null;
    select?: object | null;
    skip?: number | null;
    take?: number | null;
    where?: object | null;
}>(req: GetListRequest, res: Response, table: {
    findMany: Function;
    count: Function;
}, options?: {
    select?: W["select"];
    include?: W["include"];
    where?: W["where"];
    noNullsOnSort?: string[];
    debug?: boolean;
    transform?: (data: any) => any;
}) => Promise<void>;

declare const getManyHandler: (req: GetManyRequest, res: Response, table: {
    findMany: Function;
}) => Promise<void>;

declare const getManyReferenceHandler: (req: GetManyReferenceRequest, res: Response, table: {
    findMany: Function;
}) => Promise<void>;

declare const getOneHandler: <W extends {
    include?: object | null;
    select?: object | null;
}>(req: GetOneRequest, res: Response, table: {
    findUnique: Function;
}, arg?: W) => Promise<void>;

export { CreateRequest, DeleteManyOptions, DeleteManyRequest, DeleteOptions, DeleteRequest, GetListRequest, GetManyReferenceRequest, GetManyRequest, GetOneRequest, PaginationRequest, Request, Response, SortRequest, UpdateManyRequest, UpdateOptions, UpdateRequest, createHandler, dataProvider, defaultHandler, deleteHandler, deleteManyHandler, extractOrderBy, extractSkipTake, extractWhere, getListHandler, getManyHandler, getManyReferenceHandler, getOneHandler, updateHandler };
