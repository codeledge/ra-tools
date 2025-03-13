import { RaPayload, defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "db";
import { NextResponse } from "next/server";
import { checkAccess } from "../../../auth/checkAccess";

const route = async (req: Request) => {
  const body = (await req.json()) as RaPayload;

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
};

export { route as GET, route as POST };
