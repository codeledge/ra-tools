import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

export const prismaClient: PrismaClient =
  global.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prismaClient = prismaClient;

export const prismaReadClient = prismaClient
  .$extends(
    readReplicas({
      url: process.env.DATABASE_URL,
    })
  )
  .$replica();
