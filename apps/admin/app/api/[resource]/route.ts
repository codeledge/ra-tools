import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "db";
import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "../../../auth/checkAccess";
import { apiHandler } from "../apiHandler";

const route = apiHandler(async (req: NextRequest) => {
  const body = await req.json();

  const access = await checkAccess(body);

  const response = await defaultHandler(body, prismaClient, {
    getList: { debug: false },
    audit: {
      model: prismaClient.audit,
      authProvider: access.sessionAuthProvider,
      // enabledResources: ["post","category"],
    },
  });
  return NextResponse.json(response);
});

export { route as GET, route as POST };
