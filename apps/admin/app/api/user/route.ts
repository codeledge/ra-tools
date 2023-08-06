import {
  defaultHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { prismaClient } from "db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "../../../auth/checkAccess";

const route = async (req: NextRequest) => {
  const body = await req.json();

  await checkAccess(body);

  switch (body.method) {
    case "update": {
      const result = await updateHandler(body, prismaClient.user, {
        allowNestedUpsert: {
          settings: true,
        },
      });
      return NextResponse.json(result);
    }
    case "getOne": {
      const result = await getOneHandler<Prisma.UserFindFirstArgs>(
        body,
        prismaClient["user"],
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
      const result = await defaultHandler(body, prismaClient);
      return NextResponse.json(result);
    }
  }
};

export { route as GET, route as POST };
