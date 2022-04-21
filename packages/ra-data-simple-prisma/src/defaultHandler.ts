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
import { PrismaClient } from "@prisma/client";
import { getListHandler } from "./getListHandler";
import { getManyHandler } from "./getManyHandler";
import { getOneHandler } from "./getOneHandler";
import { updateHandler } from "./updateHandler";
import { deleteHandler, DeleteOptions } from "./deleteHandler";
import { createHandler } from "./createHandler";
import { deleteManyHandler } from "./deleteManyHandler";
import { getManyReferenceHandler } from "./getManyReferenceHandler";

export const defaultHandler = async (
  req: Request,
  res: Response,
  prisma: PrismaClient,
  options?: DeleteOptions
) => {
  const tableName = req.body.model || req.body.resource;
  if (!tableName) throw new Error(`table name is empty`);

  const prismaDelegate = prisma[tableName];
  if (!prismaDelegate)
    throw new Error(
      `No table/collection found for ${req.body.model || req.body.resource}`
    );

  switch (req.body.method) {
    case "getList": {
      return await getListHandler(req as GetListRequest, res, prismaDelegate);
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
      return await createHandler(req as CreateRequest, res, prismaDelegate);
    }
    case "update": {
      return await updateHandler(req as UpdateRequest, res, prismaDelegate);
    }
    case "delete": {
      return await deleteHandler(
        req as DeleteRequest,
        res,
        prismaDelegate,
        options
      );
    }
    case "deleteMany": {
      return await deleteManyHandler(
        req as DeleteManyRequest,
        res,
        prismaDelegate,
        options
      );
    }
    default:
      throw new Error("Invalid method");
  }
};
