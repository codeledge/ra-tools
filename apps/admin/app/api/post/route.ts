import { prismaClient } from "db";
import {
  defaultHandler,
  getListHandler,
  GetListRequest,
  createHandler,
  GetOneRequest,
  getOneHandler,
  updateHandler,
  UpdateRequest,
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

const route = async (req: Request) => {
  const body = await req.json();

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
      const result = await getListHandler<Prisma.PostFindManyArgs>(
        body as GetListRequest,
        prismaClient.post,
        {
          // debug: true,
          include: {
            tags: true,
            postToMediaRels: { include: { media: true } },
          },
          map: (posts: QueryPost[]): ReturnPost[] => {
            return posts.map((post) => {
              return {
                ...post,
                tagIds: post.tags.map((tag) => tag.id),
                mediaIds: post.postToMediaRels.map(({ media }) => media.id),
                _tags_count: post.tags.length,
              };
            });
          },
          mapRow: (
            post: ReturnPost
          ): ReturnPost & { _extraPropAfterMap: true } => {
            return {
              ...post,
              _extraPropAfterMap: true,
            };
          },
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
          transform: (post: any) => {
            post.tagIds = post.tags.map((tag: any) => tag.id);
            post.mediaIds = post.postToMediaRels.map(
              ({ media }: any) => media.id
            );
            post._tags_count = post.tagIds.length;
          },
          mapRow: (
            post: QueryPost
          ): QueryPost & { _extraPropAfterTransform: true } => {
            return {
              ...post,
              _extraPropAfterTransform: true,
            };
          },
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
