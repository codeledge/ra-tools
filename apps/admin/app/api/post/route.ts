import { prismaClient } from "db";
import {
  defaultHandler,
  getInfiniteListHandler,
  GetListRequest,
  createHandler,
  GetOneRequest,
  getOneHandler,
  updateHandler,
  UpdateRequest,
  RaPayload,
} from "ra-data-simple-prisma";
import { Prisma, Post, Tag, Media } from "@prisma/client";
import { NextResponse } from "next/server";
import { checkAccess } from "../../../auth/checkAccess";

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

const route = async (req: Request) => {
  const body: RaPayload<Prisma.ModelName> = await req.json();

  const { sessionAuthProvider: authProvider } = await checkAccess(body);

  switch (body.method) {
    case "create": {
      const result = await createHandler<Prisma.PostCreateArgs>(
        body,
        prismaClient.post,
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
            authProvider,
          },
        }
      );
      return NextResponse.json(result);
    }
    case "getList": {
      const result = await getInfiniteListHandler<Prisma.PostFindManyArgs>(
        body as GetListRequest,
        prismaClient.post,
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
        body as GetOneRequest,
        prismaClient.post,
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
        body as UpdateRequest,
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
      return NextResponse.json(result);
    }
    default: {
      const result = await defaultHandler(body, prismaClient, {
        audit: { model: prismaClient.audit, authProvider },
      });
      return NextResponse.json(result);
    }
  }
};

export { route as GET, route as POST };
