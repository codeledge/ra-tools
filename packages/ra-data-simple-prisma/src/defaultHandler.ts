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
import { getModel } from "./getModel";

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
  const model = getModel(req, prismaClient);

  switch (req.method) {
    case "create": {
      return await createHandler(req as CreateRequest, model, {
        ...options?.create,
        audit: options?.audit,
      });
    }
    case "delete": {
      return await deleteHandler(req as DeleteRequest, model, {
        ...options?.delete,
        audit: options?.audit,
      });
    }
    case "deleteMany": {
      return deleteManyHandler(req as DeleteManyRequest, model, {
        ...options?.delete,
        audit: options?.audit,
      });
    }
    case "getList": {
      return getListHandler(req as GetListRequest, model, options?.getList);
    }
    case "getMany": {
      return getManyHandler(req as GetManyRequest, model, options?.getMany);
    }
    case "getManyReference": {
      return getManyReferenceHandler(
        req as GetManyReferenceRequest,
        model,
        options?.getManyReference
      );
    }
    case "getOne": {
      return getOneHandler(req as GetOneRequest, model, options?.getOne);
    }
    case "update": {
      return await updateHandler(req as UpdateRequest, model, {
        ...options?.update,
        audit: options?.audit,
      });
    }
    case "updateMany": {
      return await updateManyHandler(req as UpdateManyRequest, model, {
        ...options?.update,
        audit: options?.audit,
      });
    }
    default:
      throw new Error("Invalid method");
  }
};
