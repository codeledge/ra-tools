import {
  CreateRequest,
  DeleteRequest,
  GetListRequest,
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

export const defaultHandler = async (
  req: Request,
  res: Response,
  prisma: PrismaClient,
  options?: DeleteOptions
) => {
  switch (req.body.method) {
    case "getList": {
      return await getListHandler(
        req as GetListRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "getOne": {
      return await getOneHandler(
        req as GetOneRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "getMany": {
      return await getManyHandler(
        req as GetManyRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "getManyReference": {
      throw new Error("Not implemented yet");
    }
    case "create": {
      return await createHandler(
        req as CreateRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "update": {
      return await updateHandler(
        req as UpdateRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "delete": {
      return await deleteHandler(
        req as DeleteRequest,
        res,
        prisma[req.body.model || req.body.resource],
        options
      );
    }
    case "deleteMany": {
      throw new Error("Not implemented yet");
    }
    default:
      throw new Error("Invalid method");
  }
};
