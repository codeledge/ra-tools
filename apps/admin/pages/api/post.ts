import prismaClient from "db";
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
import { Prisma } from "@prisma/client";

export default apiHandler(
  async (req: NextApiRequest, res: NextApiResponse, auth) => {
    switch (req.body.method) {
      case "create":
        return await createHandler<Prisma.PostCreateArgs>(
          req,
          res,
          prismaClient["post"],
          {
            connect: {
              tags: "id",
            },
            audit: { model: prismaClient.audit, authProvider: auth },
          }
        );
      case "getList":
        return await getListHandler(
          req as GetListRequest,
          res,
          prismaClient["post"],
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
        return await getOneHandler<Prisma.PostFindUniqueArgs>(
          req as GetOneRequest,
          res,
          prismaClient["post"],
          {
            include: { tags: true },
            transform: (post: any) => {
              post.tags = post.tags.map((tag: any) => tag.id);
              post._tags_count = post.tags.length;
            },
          }
        );
      case "update":
        return await updateHandler(req, res, prismaClient["post"], {
          set: {
            tags: "id",
          },
          audit: { model: prismaClient.audit, authProvider: auth },
        });
      default:
        return await defaultHandler(req, res, prismaClient, {
          audit: { model: prismaClient.audit, authProvider: auth },
        });
    }
  }
);
