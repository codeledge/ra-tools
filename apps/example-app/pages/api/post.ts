import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultHandler,
  getListHandler,
  GetListRequest,
  createHandler,
} from "ra-data-simple-prisma";
import { prismaClient } from "../../prisma/prismaClient";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.body.method) {
    case "create":
      return createHandler(req, res, prismaClient["post"], {
        connect: {
          tags: "id",
        },
      });
    case "getList":
      return getListHandler(req as GetListRequest, res, prismaClient["post"], {
        include: { tags: true },
        transform: (posts: any[]) => {
          posts.forEach((post: any) => {
            post.tags = post.tags.map((tag: any) => tag.id);
          });
        },
      });

    default:
      return defaultHandler(req, res, prismaClient);
  }
}
