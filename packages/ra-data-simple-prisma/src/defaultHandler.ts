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
import { getListHandler, GetListOptions } from "./getListHandler";
import { getManyHandler } from "./getManyHandler";
import { getOneHandler } from "./getOneHandler";
import { updateHandler, UpdateOptions } from "./updateHandler";
import { deleteHandler, DeleteOptions } from "./deleteHandler";
import { createHandler } from "./createHandler";
import { deleteManyHandler } from "./deleteManyHandler";
import { getManyReferenceHandler } from "./getManyReferenceHandler";

export const defaultHandler = async (
  req: Request,
  res: Response,
  prisma: PrismaClient,
  options?: {
    delete?: DeleteOptions;
    update?: UpdateOptions;
    getList?: GetListOptions;
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
      return createHandler(req as CreateRequest, res, model);
    }
    case "update": {
      return updateHandler(req as UpdateRequest, res, model, options?.update);
    }
    case "delete": {
      return deleteHandler(req as DeleteRequest, res, model, options?.delete);
    }
    case "deleteMany": {
      return deleteManyHandler(
        req as DeleteManyRequest,
        res,
        model,
        options?.delete
      );
    }
    default:
      throw new Error("Invalid method");
  }
};
