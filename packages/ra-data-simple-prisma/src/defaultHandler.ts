import { AuditOptions } from "./audit/types";
import {
  CreateRequest,
  DeleteManyRequest,
  DeleteRequest,
  GetListRequest,
  GetManyReferenceRequest,
  GetManyRequest,
  GetOneRequest,
  Request,
  Response,
  UpdateRequest,
} from "./Http";
import { DeleteOptions, deleteHandler } from "./deleteHandler";
import { GetListOptions, getListHandler } from "./getListHandler";
import { PrismaClient } from "@prisma/client";
import { UpdateOptions, updateHandler } from "./updateHandler";
import { createHandler } from "./createHandler";
import { deleteManyHandler } from "./deleteManyHandler";
import { getManyHandler } from "./getManyHandler";
import { getManyReferenceHandler } from "./getManyReferenceHandler";
import { getOneHandler } from "./getOneHandler";

export const defaultHandler = async (
  req: Request,
  res: Response,
  prisma: PrismaClient,
  options?: {
    delete?: DeleteOptions;
    update?: UpdateOptions;
    getList?: GetListOptions;
    auditLog?: AuditOptions;
  }
) => {
  const modelName = req.body.model || req.body.resource;
  if (!modelName) throw new Error(`model name is empty`);

  const model = prisma[modelName];
  if (!model) throw new Error(`No model found for "${modelName}"`);

  switch (req.body.method) {
    case "getList": {
      return getListHandler(
        req as GetListRequest,
        res,
        model,
        options?.getList
      );
    }
    case "getOne": {
      return getOneHandler(req as GetOneRequest, res, model);
    }
    case "getMany": {
      return getManyHandler(req as GetManyRequest, res, model);
    }
    case "getManyReference": {
      return getManyReferenceHandler(
        req as GetManyReferenceRequest,
        res,
        model
      );
    }
    case "create": {
      return await createHandler(
        req as CreateRequest,
        res,
        model,
        undefined,
        options?.auditLog
      );
    }
    case "update": {
      return await updateHandler(
        req as UpdateRequest,
        res,
        model,
        options?.update,
        options?.auditLog
      );
    }
    case "delete": {
      return await deleteHandler(
        req as DeleteRequest,
        res,
        model,
        options?.delete,
        options?.auditLog
      );
    }
    case "deleteMany": {
      return deleteManyHandler(
        req as DeleteManyRequest,
        res,
        model,
        options?.delete,
        options?.auditLog
      );
    }
    default:
      throw new Error("Invalid method");
  }
};
