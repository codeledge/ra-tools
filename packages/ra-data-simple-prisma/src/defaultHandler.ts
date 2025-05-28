import { AuditOptions } from "./audit/types";
import {
  CreateRequest,
  DeleteManyRequest,
  DeleteRequest,
  GetListRequest,
  GetManyReferenceRequest,
  GetManyRequest,
  GetOneRequest,
  RaPayload,
  UpdateManyRequest,
  UpdateRequest,
} from "./Http";
import { DeleteOptions, deleteHandler } from "./deleteHandler";
import { GetListOptions, getListHandler } from "./getListHandler";
import { UpdateOptions, updateHandler } from "./updateHandler";
import { createHandler, CreateOptions } from "./createHandler";
import { deleteManyHandler } from "./deleteManyHandler";
import { getManyHandler, GetManyOptions } from "./getManyHandler";
import {
  getManyReferenceHandler,
  GetManyReferenceOptions,
} from "./getManyReferenceHandler";
import { getOneHandler, GetOneOptions } from "./getOneHandler";
import { updateManyHandler } from "./updateManyHandler";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export const defaultHandler = async (
  req: RaPayload,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: {
    audit?: AuditOptions;
    create?: CreateOptions;
    delete?: DeleteOptions;
    getList?: GetListOptions;
    getMany?: GetManyOptions;
    getManyReference?: GetManyReferenceOptions;
    getOne?: GetOneOptions;
    update?: UpdateOptions;
  }
) => {
  switch (req.method) {
    case "create": {
      return await createHandler(req as CreateRequest, prismaClient, {
        ...options?.create,
        audit: options?.audit,
      });
    }
    case "delete": {
      return await deleteHandler(req as DeleteRequest, prismaClient, {
        ...options?.delete,
        audit: options?.audit,
      });
    }
    case "deleteMany": {
      return deleteManyHandler(req as DeleteManyRequest, prismaClient, {
        ...options?.delete,
        audit: options?.audit,
      });
    }
    case "getList": {
      return getListHandler(
        req as GetListRequest,
        prismaClient,
        options?.getList
      );
    }
    case "getMany": {
      return getManyHandler(
        req as GetManyRequest,
        prismaClient,
        options?.getMany
      );
    }
    case "getManyReference": {
      return getManyReferenceHandler(
        req as GetManyReferenceRequest,
        prismaClient,
        options?.getManyReference
      );
    }
    case "getOne": {
      return getOneHandler(req as GetOneRequest, prismaClient, options?.getOne);
    }
    case "update": {
      return await updateHandler(req as UpdateRequest, prismaClient, {
        ...options?.update,
        audit: options?.audit,
      });
    }
    case "updateMany": {
      return await updateManyHandler(req as UpdateManyRequest, prismaClient, {
        ...options?.update,
        audit: options?.audit,
      });
    }
    default:
      throw new Error("Invalid method");
  }
};
