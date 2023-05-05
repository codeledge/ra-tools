import { PrismaClient } from "@prisma/client";

export const prismaClient: PrismaClient =
  global.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prismaClient = prismaClient;
