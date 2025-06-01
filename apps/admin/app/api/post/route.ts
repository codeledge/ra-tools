import { prismaClient } from "db";
import {
  defaultHandler,
  getListHandler,
  createHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { Prisma, Post, Tag, Media } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiHandler } from "../apiHandler";

type QueryPost = Post & {
  tags: Tag[];
  postToMediaRels: { media: Media }[];
};

type ReturnPost = QueryPost & {
  tagIds: Tag["id"][];
  mediaIds: Media["id"][];
  _tags_count: number;
};

const transformPost = async (post: QueryPost): Promise<ReturnPost> => {
  return {
    ...post,
    tagIds: post.tags.map((tag) => tag.id),
    mediaIds: post.postToMediaRels.map(({ media }) => media.id),
    _tags_count: await Promise.resolve(post.tags.length),
  };
};

const route = apiHandler(async (raPayload, { sessionAuthProvider }) => {
  switch (raPayload.method) {
    case "create": {
      const result = await createHandler<Prisma.PostCreateArgs>(
        raPayload,
        prismaClient,
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
          audit: {
            model: prismaClient.audit,
            authProvider: sessionAuthProvider,
          },
        }
      );
      return NextResponse.json(result);
    }
    case "getList": {
      const result = await getListHandler<Prisma.PostFindManyArgs>(
        raPayload,
        prismaClient,
        {
          // debug: true,
          include: {
            tags: true,
            postToMediaRels: { include: { media: true } },
          },
          transformRow: transformPost,
        }
      );
      return NextResponse.json(result);
    }
    case "getOne": {
      const result = await getOneHandler<Prisma.PostFindUniqueArgs>(
        raPayload,
        prismaClient,
        {
          include: {
            tags: true,
            postToMediaRels: { include: { media: true } },
          },
          transform: transformPost,
        }
      );
      return NextResponse.json(result);
    }
    case "update": {
      const result = await updateHandler<Prisma.PostUpdateArgs>(
        raPayload,
        prismaClient,
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
          audit: {
            model: prismaClient.audit,
            authProvider: sessionAuthProvider,
          },
          // debug: true,
        }
      );
      return NextResponse.json(result);
    }
    default: {
      const result = await defaultHandler(raPayload, prismaClient, {
        audit: { model: prismaClient.audit, authProvider: sessionAuthProvider },
      });
      return NextResponse.json(result);
    }
  }
});

export { route as GET, route as POST };
