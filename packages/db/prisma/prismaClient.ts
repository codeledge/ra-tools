import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

declare global {
  var prismaClient: PrismaClient;
}

export const prismaClient: PrismaClient =
  global.prismaClient ||
  new PrismaClient({
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") global.prismaClient = prismaClient;

export const prismaLogClient = prismaClient.$extends({
  query: {
    beforeAll: async (params) => {
      console.info("$extends beforeAll", params);
      return params;
    },
  },
});

export const prismaReadClient = prismaClient
  .$extends(
    readReplicas({
      url: process.env.DATABASE_URL,
    })
  )
  .$replica();
