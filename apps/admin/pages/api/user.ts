import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import { prismaClient } from "db";
import { Prisma } from "@prisma/client";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.body.method) {
    case "update":
      await updateHandler(req, res, prismaClient["user"], {
        allowNestedUpsert: {
          settings: true,
        },
      });
      break;
    case "getOne":
      await getOneHandler<Prisma.UserFindFirstArgs>(
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
      break;
    default:
      await defaultHandler(req, res, prismaClient);
      break;
  }
});
