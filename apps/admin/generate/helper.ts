import { Prisma } from "@prisma/client";

export const tables = Object.keys(Prisma.ModelName);
