import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultHandler,
  getListHandler,
  GetListRequest,
  createHandler,
  GetOneRequest,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import { prismaWebClient } from "./../../../website/prisma/prismaWebClient";

export default apiHandler((req: NextApiRequest, res: NextApiResponse) => {
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
    case "getOne":
      return getOneHandler(req as GetOneRequest, res, prismaWebClient["post"], {
        include: { tags: true },
        transform: (post: any) => {
          post.tags = post.tags.map((tag: any) => tag.id);
          post._tags_count = post.tags.length;
        },
      });
    case "update":
      return updateHandler(req, res, prismaWebClient["post"], {
        set: {
          tags: "id",
        },
      });
    default:
      return defaultHandler(req, res, prismaWebClient);
  }
});
