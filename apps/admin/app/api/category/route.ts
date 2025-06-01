import { prismaClient, prismaReadClient } from "db";
import {
  getInfiniteListHandler,
  getManyHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiHandler } from "../apiHandler";

const route = apiHandler(
  async (raPayload, { sessionAuthProvider: authProvider }) => {
    switch (raPayload.method) {
      case "update": {
        const result = await updateHandler<Prisma.CategoryUpdateArgs>(
          raPayload,
          prismaClient
        );
        return NextResponse.json(result);
      }
      case "getOne": {
        const result = await getOneHandler<Prisma.CategoryFindFirstArgs>(
          raPayload,
          prismaReadClient,
          {
            select: {
              id: true,

              parentCategoryId: true,
            },
          }
        );
        return NextResponse.json(result);
      }
      case "getList": {
        const result =
          await getInfiniteListHandler<Prisma.CategoryFindManyArgs>(
            raPayload,
            prismaReadClient,
            {
              noNullsOnSort: ["parentCategoryId"],
            }
          );
        return NextResponse.json(result);
      }
      case "getMany": {
        const result = await getManyHandler<Prisma.CategoryFindManyArgs>(
          raPayload,
          prismaReadClient
        );
        return NextResponse.json(result);
      }
      default: {
        return NextResponse.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }
    }
  }
);

export { route as GET, route as POST };
