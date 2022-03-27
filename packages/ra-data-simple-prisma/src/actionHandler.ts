import {
  GetListRequest,
  GetManyRequest,
  GetOneRequest,
  Request,
  Response,
  UpdateRequest,
} from "./Http";
import { PrismaClient } from "@prisma/client";
import { getListAction } from "./getListAction";
import { getManyAction } from "./getManyAction";
import { getOneAction } from "./getOneAction";
import { updateAction } from "./updateAction";

export const actionHandler = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  switch (req.body.action) {
    case "getList": {
      return await getListAction(
        req as GetListRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "getOne": {
      return await getOneAction(
        req as GetOneRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "getMany": {
      return await getManyAction(
        req as GetManyRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    case "getManyReference": {
      throw new Error("Not implemented yet");
    }
    case "create": {
      throw new Error("Not implemented yet");
    }
    case "update": {
      return await updateAction(
        req as UpdateRequest,
        res,
        prisma[req.body.model || req.body.resource]
      );
    }
    default:
      throw new Error("wrong action");
  }
};
