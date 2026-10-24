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

/**
 * Per-call options for a bound handler. Shared default keys (`prismaClient`,
 * `resourceToModelMap`, `audit`) stay partial so call sites can override them
 * without satisfying the full handler option types (e.g. `AuditOptions` requires
 * `authProvider`, which is usually supplied only at the call site).
 */
export type BoundHandlerOptions<Opts extends object> = Omit<
  Opts,
  keyof HandlerDefaultsOverride
> &
  HandlerDefaultsOverride;

const resolvePrismaClient = (
  defaults: BindHandlerDefaults,
  options?: HandlerDefaultsOverride,
) => options?.prismaClient ?? defaults.prismaClient;

const mergeHandlerOptions = <Opts extends object>(
  defaults: BindWriteHandlerDefaults,
  options?: BoundHandlerOptions<Opts>,
): Opts => {
  const { prismaClient: _prismaClient, ...callRest } = (options ??
    {}) as BoundHandlerOptions<Opts>;
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

export const bindCreateHandler = (defaults: BindWriteHandlerDefaults) => {
  return <Args extends CreateArgs>(
    req: CreateRequest,
    options?: BoundHandlerOptions<CreateOptions<Omit<Args, "data">>>,
  ) =>
    createHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<CreateOptions<Omit<Args, "data">>>(defaults, options),
    );
};

export const bindDeleteHandler = (defaults: BindWriteHandlerDefaults) => {
  return <W extends DeleteArgs>(
    req: DeleteRequest,
    options?: BoundHandlerOptions<DeleteOptions>,
  ) =>
    deleteHandler<W>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<DeleteOptions>(defaults, options),
    );
};

export const bindDeleteManyHandler = (defaults: BindWriteHandlerDefaults) => {
  return (
    req: DeleteManyRequest,
    options?: BoundHandlerOptions<DeleteManyOptions>,
  ) =>
    deleteManyHandler(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<DeleteManyOptions>(defaults, options),
    );
};

export const bindGetListHandler = (defaults: BindHandlerDefaults) => {
  return <Args extends GetListArgs>(
    req: GetListRequest,
    options?: BoundHandlerOptions<GetListOptions<Args>>,
  ) =>
    getListHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetListOptions<Args>>(defaults, options),
    );
};

export const bindGetInfiniteListHandler = (defaults: BindHandlerDefaults) => {
  return <Args extends GetListArgs>(
    req: GetListRequest,
    options?: BoundHandlerOptions<GetListOptions<Args>>,
  ) =>
    getInfiniteListHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetListOptions<Args>>(defaults, options),
    );
};

export const bindGetManyHandler = (defaults: BindHandlerDefaults) => {
  return <Args extends GetManyArgs>(
    req: GetManyRequest,
    options?: BoundHandlerOptions<GetManyOptions<Args>>,
  ) =>
    getManyHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetManyOptions<Args>>(defaults, options),
    );
};

export const bindGetManyReferenceHandler = (defaults: BindHandlerDefaults) => {
  return <Args extends GetManyReferenceArgs>(
    req: GetManyReferenceRequest,
    options?: BoundHandlerOptions<GetManyReferenceOptions<Args>>,
  ) =>
    getManyReferenceHandler<Args>(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<GetManyReferenceOptions<Args>>(defaults, options),
    );
};

export const bindGetOneHandler = (defaults: BindHandlerDefaults) => {
  return <Args extends GetOneArgs>(
    req: GetOneRequest,
    options?: BoundHandlerOptions<GetOneOptions<Omit<Args, "where">>>,
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

export const bindUpdateHandler = (defaults: BindWriteHandlerDefaults) => {
  return <Args extends UpdateArgs>(
    req: UpdateRequest,
    options?: BoundHandlerOptions<UpdateOptions<Omit<Args, "data" | "where">>>,
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

export const bindUpdateManyHandler = (defaults: BindWriteHandlerDefaults) => {
  return <Args extends UpdateArgs>(
    req: UpdateManyRequest,
    options?: BoundHandlerOptions<
      Omit<UpdateOptions<Args>, "select" | "include">
    >,
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

export const bindDefaultHandler = (defaults: BindWriteHandlerDefaults) => {
  return (
    req: RaPayload,
    options?: BoundHandlerOptions<DefaultHandlerOptions>,
  ) =>
    defaultHandler(
      req,
      resolvePrismaClient(defaults, options),
      mergeHandlerOptions<DefaultHandlerOptions>(defaults, options),
    );
};
