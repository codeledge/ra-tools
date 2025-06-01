import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "db";
import { NextResponse } from "next/server";
import { apiHandler } from "../apiHandler";

const route = apiHandler(
  async (raPayload, { sessionAuthProvider: authProvider }) => {
    const response = await defaultHandler(raPayload, prismaClient, {
      getList: { debug: false },
      audit: {
        model: prismaClient.audit,
        authProvider,
        // enabledResources: ["post","category"],
      },
    });
    return NextResponse.json(response);
  }
);

export { route as GET, route as POST };
