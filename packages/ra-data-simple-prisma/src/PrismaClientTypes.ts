import { PrismaClient } from "@prisma/client";
import { DynamicClientExtensionThis } from "@prisma/client/runtime/library";

export type PrismaClientOrDynamicClientExtension =
  | PrismaClient
  | DynamicClientExtensionThis<
      {},
      {
        params: { extArgs: { result: {}; model: {}; client: {}; query: {} } };
        returns: {};
      },
      {}
    >; // A stub of the extended client type
