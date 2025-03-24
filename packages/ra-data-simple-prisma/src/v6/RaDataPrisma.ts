import { PrismaClient } from "@prisma/client";
import { GetOneRequest, RaPayload } from "../Http";
import { AuthProvider } from "react-admin";
import { GetOneArgs, getOneHandler, GetOneOptions } from "../getOneHandler";

type AuditOptions2 = {
  model: { create: Function };
  authProvider: AuthProvider;
  columns?: {
    id?: string;
    date?: string;
    resource?: string;
    action?: string;
    payload?: string;
    authorId?: string;
  };
  actions?: {
    write?: boolean;
    read?: boolean;
    delete?: boolean;
  };
  resources?: string[];
};

type GlobalOptions = {
  debug?: boolean;
  omitFields?: string[];
  audit?: AuditOptions2;
};

export class RaDataPrisma {
  prismaClient: PrismaClient;
  options: GlobalOptions;

  constructor(prismaClient: PrismaClient, options?: GlobalOptions) {
    this.prismaClient = prismaClient;
    this.options = options ?? {};
  }

  getModel = (
    req: RaPayload
  ): {
    findUnique: Function;
    findUniqueOrThrow: Function;
    findFirst: Function;
    findFirstOrThrow: Function;
    findMany: Function;
    create: Function;
    createMany: Function;
    update: Function;
    updateMany: Function;
    upsert: Function;
    delete: Function;
    deleteMany: Function;
    aggregate: Function;
    groupBy: Function;
    count: Function;
    findRaw: Function;
    aggregateRaw: Function;
  } => {
    const model = this.prismaClient[req.model ?? req.resource];
    if (!model) throw new Error(`Model ${model} not found`);
    return model;
  };

  getOne = <Args extends GetOneArgs>(
    req: GetOneRequest,
    options?: GetOneOptions<Omit<Args, "where">>
  ) => {
    return getOneHandler(req, this.getModel(req), options);
  };
}
