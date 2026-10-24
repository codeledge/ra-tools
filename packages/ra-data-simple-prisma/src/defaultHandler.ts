import type { AuditOptions } from "./audit/types";
import { type CreateOptions, createHandler } from "./createHandler";
import { type DeleteOptions, deleteHandler } from "./deleteHandler";
import { type DeleteManyOptions, deleteManyHandler } from "./deleteManyHandler";
import { type GetListOptions, getListHandler } from "./getListHandler";
import { type GetManyOptions, getManyHandler } from "./getManyHandler";
import {
  type GetManyReferenceOptions,
  getManyReferenceHandler,
} from "./getManyReferenceHandler";
import { type ResourceToModelMap } from "./getModel";
import { type GetOneOptions, getOneHandler } from "./getOneHandler";
import type {
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
import type { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";
import { type UpdateOptions, updateHandler } from "./updateHandler";
import { updateManyHandler } from "./updateManyHandler";

export type DefaultHandlerOptions = {
  audit?: AuditOptions;
  create?: CreateOptions;
  delete?: DeleteOptions;
  deleteMany?: DeleteManyOptions;
  getList?: GetListOptions;
  getMany?: GetManyOptions;
  getManyReference?: GetManyReferenceOptions;
  getOne?: GetOneOptions;
  resourceToModelMap?: ResourceToModelMap;
  update?: UpdateOptions;
};

const withResourceToModelMap = <T extends object>(
  handlerOptions: T | undefined,
  resourceToModelMap?: ResourceToModelMap,
) => ({
  ...(resourceToModelMap ? { resourceToModelMap } : {}),
  ...handlerOptions,
});

export const defaultHandler = async (
  req: RaPayload,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: DefaultHandlerOptions,
) => {
  switch (req.method) {
    case "create": {
      return await createHandler(req as CreateRequest, prismaClient, {
        ...withResourceToModelMap(options?.create, options?.resourceToModelMap),
        audit: options?.audit,
      });
    }
    case "delete": {
      return await deleteHandler(req as DeleteRequest, prismaClient, {
        ...withResourceToModelMap(options?.delete, options?.resourceToModelMap),
        audit: options?.audit,
      });
    }
    case "deleteMany": {
      return deleteManyHandler(req as DeleteManyRequest, prismaClient, {
        ...withResourceToModelMap(options?.delete, options?.resourceToModelMap),
        audit: options?.audit,
      });
    }
    case "getList": {
      return getListHandler(
        req as GetListRequest,
        prismaClient,
        withResourceToModelMap(options?.getList, options?.resourceToModelMap),
      );
    }
    case "getMany": {
      return getManyHandler(
        req as GetManyRequest,
        prismaClient,
        withResourceToModelMap(options?.getMany, options?.resourceToModelMap),
      );
    }
    case "getManyReference": {
      return getManyReferenceHandler(
        req as GetManyReferenceRequest,
        prismaClient,
        withResourceToModelMap(
          options?.getManyReference,
          options?.resourceToModelMap,
        ),
      );
    }
    case "getOne": {
      return getOneHandler(
        req as GetOneRequest,
        prismaClient,
        withResourceToModelMap(options?.getOne, options?.resourceToModelMap),
      );
    }
    case "update": {
      return await updateHandler(req as UpdateRequest, prismaClient, {
        ...withResourceToModelMap(options?.update, options?.resourceToModelMap),
        audit: options?.audit,
      });
    }
    case "updateMany": {
      return await updateManyHandler(req as UpdateManyRequest, prismaClient, {
        ...withResourceToModelMap(options?.update, options?.resourceToModelMap),
        audit: options?.audit,
      });
    }
    default:
      throw new Error("Invalid method");
  }
};
