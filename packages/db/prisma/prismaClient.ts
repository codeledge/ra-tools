import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readReplicas } from "@prisma/extension-read-replicas";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

declare global {
  var prismaClient: PrismaClient;
}

export const prismaClient =
  global.prismaClient ||
  new PrismaClient({
    adapter,
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") global.prismaClient = prismaClient;

export const prismaReadClient = new PrismaClient({ adapter })
  .$extends(
    readReplicas({
      url: process.env.DATABASE_URL,
    })
  )
  .$replica();
