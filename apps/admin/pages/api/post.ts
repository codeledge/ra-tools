import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultHandler,
  getListHandler,
  GetListRequest,
  createHandler,
} from "ra-data-simple-prisma";
import { prismaWebClient } from "./../../../website/prisma/prismaWebClient";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.body.method) {
    case "create":
      return createHandler(req, res, prismaWebClient["post"], {
        connect: {
          tags: "id",
        },
      });
    case "getList":
      return getListHandler(
        req as GetListRequest,
        res,
        prismaWebClient["post"],
        {
          include: { tags: true },
          transform: (posts: any[]) => {
            posts.forEach((post: any) => {
              post.tags = post.tags.map((tag: any) => tag.id);
              post._tags_count = post.tags.length;
            });
          },
        }
      );

    default:
      return defaultHandler(req, res, prismaWebClient);
  }
}
