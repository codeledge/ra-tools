import {
  defaultHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { prismaClient } from "db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiHandler } from "../apiHandler";

const route = apiHandler(async (raPayload) => {
  switch (raPayload.method) {
    case "update": {
      const result = await updateHandler(raPayload, prismaClient, {
        allowNestedUpsert: {
          settings: true,
        },
      });
      return NextResponse.json(result);
    }
    case "getOne": {
      const result = await getOneHandler<Prisma.UserFindFirstArgs>(
        raPayload,
        prismaClient,
        {
          include: {
            settings: {
              select: {
                language: true,
              },
            },
          },
        }
      );
      return NextResponse.json(result);
    }
    default: {
      const result = await defaultHandler(raPayload, prismaClient);
      return NextResponse.json(result);
    }
  }
});

export { route as GET, route as POST };
