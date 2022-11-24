import { PrismaClient } from "@prisma/client";

export const prismaClient = global.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prismaClient;
