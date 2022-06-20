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
  const tableName = req.body.model || req.body.resource;
  if (!tableName) throw new Error(`table name is empty`);

  const prismaDelegate = (prisma as any)[tableName];
  if (!prismaDelegate)
    throw new Error(
      `No model found for "${req.body.model || req.body.resource}"`
    );

  switch (req.body.method) {
    case "getList": {
      return await getListHandler(
        req as GetListRequest,
        res,
        prismaDelegate,
        options?.getList
      );
    }
    case "getOne": {
      return await getOneHandler(req as GetOneRequest, res, prismaDelegate);
    }
    case "getMany": {
      return await getManyHandler(req as GetManyRequest, res, prismaDelegate);
    }
    case "getManyReference": {
      throw await getManyReferenceHandler(
        req as GetManyReferenceRequest,
        res,
        prismaDelegate
      );
    }
    case "create": {
      return await createHandler(
        req as CreateRequest,
        res,
        prismaDelegate,
        undefined,
        options?.auditLog
      );
    }
    case "update": {
      return await updateHandler(
        req as UpdateRequest,
        res,
        prismaDelegate,
        options?.update,
        options?.auditLog
      );
    }
    case "delete": {
      return await deleteHandler(
        req as DeleteRequest,
        res,
        prismaDelegate,
        options?.delete,
        options?.auditLog
      );
    }
    case "deleteMany": {
      return await deleteManyHandler(
        req as DeleteManyRequest,
        res,
        prismaDelegate,
        options?.delete,
        options?.auditLog
      );
    }
    default:
      throw new Error("Invalid method");
  }
};
