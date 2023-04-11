import { prismaClient } from "db";
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
import { Prisma, Post, Tag, Media } from "@prisma/client";

export type AdminPost = Post & {
  tagIds: Tag["id"][];
  mediaIds: Media["id"][];
  _tags_count: number;
};

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
              //tags: "id", if the prop is tag: [1,2,3]
              tagIds: {
                tags: "id",
              },
              mediaIds: {
                postToMediaRels: {
                  media: "id",
                },
              },
            },
            audit: { model: prismaClient.audit, authProvider: auth },
            debug: true,
          }
        );
      case "getList":
        return await getListHandler<Prisma.PostFindManyArgs>(
          req as GetListRequest,
          res,
          prismaClient.post,
          {
            include: {
              tags: true,
              postToMediaRels: { include: { media: true } },
            },
            transform: (
              posts: (AdminPost & { tags: any[]; postToMediaRels: any })[]
            ) => {
              posts.forEach((post) => {
                post.tagIds = post["tags"].map((tag: any) => tag.id);
                post.mediaIds = post["postToMediaRels"].map(
                  ({ media }: any) => media.id
                );
                post._tags_count = post.tagIds.length;
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
            include: {
              tags: true,
              postToMediaRels: { include: { media: true } },
            },
            transform: (post: any) => {
              post.tagIds = post.tags.map((tag: any) => tag.id);
              post.mediaIds = post.postToMediaRels.map(
                ({ media }: any) => media.id
              );
              post._tags_count = post.tagIds.length;
            },
          }
        );
      case "update":
        return await updateHandler<Prisma.PostUpdateArgs>(
          req,
          res,
          prismaClient["post"],
          {
            set: {
              //tags: "id", if the prop is tag: [1,2,3]
              tagIds: {
                tags: "id",
              },
              mediaIds: {
                postToMediaRels: {
                  media: "id",
                },
              },
            },
            audit: { model: prismaClient.audit, authProvider: auth },
          }
        );
      default:
        return await defaultHandler(req, res, prismaClient, {
          audit: { model: prismaClient.audit, authProvider: auth },
        });
    }
  }
);
