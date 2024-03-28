import { prismaClient, prismaReadClient } from "db";
import {
  defaultHandler,
  getInfiniteListHandler,
  RaPayload,
} from "ra-data-simple-prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { checkAccess } from "../../../auth/checkAccess";

const route = async (req: Request) => {
  const body: RaPayload<Prisma.ModelName> = await req.json();

  const { sessionAuthProvider: authProvider } = await checkAccess(body);

  switch (body.method) {
    case "getList": {
      const result = await getInfiniteListHandler<Prisma.CategoryFindManyArgs>(
        body,
        prismaReadClient.category,
        {
          noNullsOnSort: ["parentCategoryId"],
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
