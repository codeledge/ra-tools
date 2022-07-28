import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import prismaClient from "db";
import { Prisma } from "@prisma/client";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.body.method) {
    case "update":
      return updateHandler(req, res, prismaClient["user"], {
        debug: true,
        allowNestedUpsert: {
          settings: true,
        },
      });
    case "getOne":
      return getOneHandler<Prisma.UserFindUniqueArgs>(
        req,
        res,
        prismaClient["user"],
        {
          include: {
            settings: {
              select: {
                language: true,
              },
            },
          },
        }
      );
    default:
      return defaultHandler(req, res, prismaClient);
  }
});
