import type { AuditOptions } from "./audit/types";
import {
  type CreateArgs,
  type CreateOptions,
  createHandler,
} from "./createHandler";
import { type DefaultHandlerOptions, defaultHandler } from "./defaultHandler";
import {
  type DeleteArgs,
  type DeleteOptions,
  deleteHandler,
} from "./deleteHandler";
import { type DeleteManyOptions, deleteManyHandler } from "./deleteManyHandler";
import { getInfiniteListHandler } from "./getInfiniteListHandler";
import {
  type GetListArgs,
  type GetListOptions,
  getListHandler,
} from "./getListHandler";
import { type ResourceToModelMap } from "./getModel";
import {
  type GetManyArgs,
  type GetManyOptions,
  getManyHandler,
} from "./getManyHandler";
import {
  type GetManyReferenceArgs,
  type GetManyReferenceOptions,
  getManyReferenceHandler,
} from "./getManyReferenceHandler";
import {
  type GetOneArgs,
  type GetOneOptions,
  getOneHandler,
} from "./getOneHandler";
import type {
  CreateRequest,
  DeleteManyRequest,
  DeleteRequest,
  GetListRequest,
  GetManyReferenceRequest,
  GetManyRequest,
  GetOneRequest,
  RaPayload,
  UpdateManyRequest,
  UpdateRequest,
} from "./Http";
import type { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";
import {
  type UpdateArgs,
  type UpdateOptions,
  updateHandler,
} from "./updateHandler";
import { updateManyHandler } from "./updateManyHandler";

export type BindHandlerDefaults = {
  prismaClient: PrismaClientOrDynamicClientExtension;
  resourceToModelMap?: ResourceToModelMap;
};

export type BindWriteHandlerDefaults = BindHandlerDefaults & {
  audit?: Partial<AuditOptions>;
};

export type HandlerDefaultsOverride = {
  prismaClient?: PrismaClientOrDynamicClientExtension;
  resourceToModelMap?: ResourceToModelMap;
  audit?: Partial<AuditOptions>;
};

const resolvePrismaClient = (
  defaults: BindHandlerDefaults,
  options?: HandlerDefaultsOverride,
) => options?.prismaClient ?? defaults.prismaClient;

const mergeHandlerOptions = <Opts extends object>(
  defaults: BindWriteHandlerDefaults,
  options?: Opts & HandlerDefaultsOverride,
): Opts => {
  const { prismaClient: _prismaClient, ...callRest } = (options ?? {}) as Opts &
    HandlerDefaultsOverride;
  const { prismaClient: _defaultPrismaClient, ...defaultRest } = defaults;

  const mergedAudit =
    defaultRest.audit || (callRest as HandlerDefaultsOverride).audit
      ? {
          ...defaultRest.audit,
          ...(callRest as HandlerDefaultsOverride).audit,
        }
      : undefined;

  return {
    ...defaultRest,
    ...callRest,
    ...(mergedAudit ? { audit: mergedAudit } : {}),
  } as Opts;
};

export const bindCreateHandler = (
  defaults: BindWriteHandlerDefaults & CreateOptions,
) => {
  return <Args extends CreateArgs>(
    req: CreateRequest,
    options?: CreateOptions<Omit<Args, "data">> & HandlerDefaultsOverride,
  ) =>
    createHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<CreateOptions<Omit<Args, "data">>>(defaults, options),
    );
};

export const bindDeleteHandler = (
  defaults: BindWriteHandlerDefaults & DeleteOptions,
) => {
  return <W extends DeleteArgs>(
    req: DeleteRequest,
    options?: DeleteOptions & HandlerDefaultsOverride,
  ) =>
    deleteHandler<W>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<DeleteOptions>(defaults, options),
    );
};

export const bindDeleteManyHandler = (
  defaults: BindWriteHandlerDefaults & DeleteManyOptions,
) => {
  return (
    req: DeleteManyRequest,
    options?: DeleteManyOptions & HandlerDefaultsOverride,
  ) =>
    deleteManyHandler(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<DeleteManyOptions>(defaults, options),
    );
};

export const bindGetListHandler = (
  defaults: BindHandlerDefaults & GetListOptions,
) => {
  return <Args extends GetListArgs>(
    req: GetListRequest,
    options?: GetListOptions<Args> & HandlerDefaultsOverride,
  ) =>
    getListHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetListOptions<Args>>(defaults, options),
    );
};

export const bindGetInfiniteListHandler = (
  defaults: BindHandlerDefaults & GetListOptions,
) => {
  return <Args extends GetListArgs>(
    req: GetListRequest,
    options?: GetListOptions<Args> & HandlerDefaultsOverride,
  ) =>
    getInfiniteListHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetListOptions<Args>>(defaults, options),
    );
};

export const bindGetManyHandler = (
  defaults: BindHandlerDefaults & GetManyOptions,
) => {
  return <Args extends GetManyArgs>(
    req: GetManyRequest,
    options?: GetManyOptions<Args> & HandlerDefaultsOverride,
  ) =>
    getManyHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetManyOptions<Args>>(defaults, options),
    );
};

export const bindGetManyReferenceHandler = (
  defaults: BindHandlerDefaults & GetManyReferenceOptions,
) => {
  return <Args extends GetManyReferenceArgs>(
    req: GetManyReferenceRequest,
    options?: GetManyReferenceOptions<Args> & HandlerDefaultsOverride,
  ) =>
    getManyReferenceHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetManyReferenceOptions<Args>>(defaults, options),
    );
};

export const bindGetOneHandler = (
  defaults: BindHandlerDefaults & GetOneOptions,
) => {
  return <Args extends GetOneArgs>(
    req: GetOneRequest,
    options?: GetOneOptions<Omit<Args, "where">> & HandlerDefaultsOverride,
  ) =>
    getOneHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetOneOptions<Omit<Args, "where">>>(
        defaults,
        options,
      ),
    );
};

export const bindUpdateHandler = (
  defaults: BindWriteHandlerDefaults & UpdateOptions,
) => {
  return <Args extends UpdateArgs>(
    req: UpdateRequest,
    options?: UpdateOptions<Omit<Args, "data" | "where">> &
      HandlerDefaultsOverride,
  ) =>
    updateHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<UpdateOptions<Omit<Args, "data" | "where">>>(
        defaults,
        options,
      ),
    );
};

export const bindUpdateManyHandler = (
  defaults: BindWriteHandlerDefaults &
    Omit<UpdateOptions, "select" | "include">,
) => {
  return <Args extends UpdateArgs>(
    req: UpdateManyRequest,
    options?: Omit<UpdateOptions<Args>, "select" | "include"> &
      HandlerDefaultsOverride,
  ) =>
    updateManyHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<Omit<UpdateOptions<Args>, "select" | "include">>(
        defaults,
        options,
      ),
    );
};

export const bindDefaultHandler = (
  defaults: BindWriteHandlerDefaults & DefaultHandlerOptions,
) => {
  return (
    req: RaPayload,
    options?: DefaultHandlerOptions & HandlerDefaultsOverride,
  ) =>
    defaultHandler(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<DefaultHandlerOptions>(defaults, options),
    );
};
