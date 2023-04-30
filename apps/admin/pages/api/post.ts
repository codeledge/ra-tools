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
import { AuthProvider } from "react-admin";

export type AdminPost = Post & {
  tagIds: Tag["id"][];
  mediaIds: Media["id"][];
  _tags_count: number;
};

export default apiHandler(
  async (
    req: NextApiRequest,
    res: NextApiResponse,
    authProvider: AuthProvider
  ) => {
    switch (req.body.method) {
      case "create":
        await createHandler<Prisma.PostCreateArgs>(
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
            audit: { model: prismaClient.audit, authProvider },
          }
        );
        break;
      case "getList":
        await getListHandler<Prisma.PostFindManyArgs>(
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
        break;
      case "getOne": {
        await getOneHandler<Prisma.PostFindUniqueArgs>(
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
        break;
      }
      case "update": {
        await updateHandler<Prisma.PostUpdateArgs>(
          req,
          res,
          prismaClient.post,
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
            audit: { model: prismaClient.audit, authProvider },
            // debug: true,
          }
        );
        break;
      }
      default:
        await defaultHandler(req, res, prismaClient, {
          audit: { model: prismaClient.audit, authProvider },
        });
        break;
    }
  }
);
