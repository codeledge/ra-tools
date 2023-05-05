import { prismaClient } from "db";
import { Permission } from "ra-data-simple-prisma";
import { Role } from "@prisma/client";

export type Permissions = Permission<keyof typeof prismaClient>[];

export type PermissionsConfig = {
  [role in Role]: Permission<keyof typeof prismaClient>[];
};
