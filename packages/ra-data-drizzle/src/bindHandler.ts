import type { AuditOptions } from "./audit/types";
import {
  type CreateArgs,
  type CreateOptions,
  createHandler,
} from "./createHandler";
import { type DefaultHandlerOptions, defaultHandler } from "./defaultHandler";
import { type DeleteOptions, deleteHandler } from "./deleteHandler";
import { type DeleteManyOptions, deleteManyHandler } from "./deleteManyHandler";
import type { DrizzleDatabase, ResourceToTableMap } from "./DrizzleTypes";
import { getInfiniteListHandler } from "./getInfiniteListHandler";
import {
  type GetListArgs,
  type GetListOptions,
  getListHandler,
} from "./getListHandler";
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
import {
  type UpdateArgs,
  type UpdateOptions,
  updateHandler,
} from "./updateHandler";
import { updateManyHandler } from "./updateManyHandler";

export type BindHandlerDefaults = {
  db: DrizzleDatabase;
  resourceToTableMap?: ResourceToTableMap;
};

export type BindWriteHandlerDefaults = BindHandlerDefaults & {
  audit?: Partial<AuditOptions>;
};

export type HandlerDefaultsOverride = {
  db?: DrizzleDatabase;
  resourceToTableMap?: ResourceToTableMap;
  audit?: Partial<AuditOptions>;
};

/**
 * Per-call options for a bound handler. Shared default keys (`db`,
 * `resourceToTableMap`, `audit`) stay partial so call sites can override them
 * without satisfying the full handler option types (e.g. `AuditOptions` requires
 * `authProvider`, which is usually supplied only at the call site).
 * Passing `db` lets a call run inside a transaction.
 */
export type BoundHandlerOptions<Opts extends object> = Omit<
  Opts,
  keyof HandlerDefaultsOverride
> &
  HandlerDefaultsOverride;

const resolveDb = (
  defaults: BindHandlerDefaults,
  options?: HandlerDefaultsOverride,
) => options?.db ?? defaults.db;

const mergeHandlerOptions = <Opts extends object>(
  defaults: BindWriteHandlerDefaults,
  options?: BoundHandlerOptions<Opts>,
): Opts => {
  const { db: _db, ...callRest } = (options ?? {}) as BoundHandlerOptions<Opts>;
  const { db: _defaultDb, ...defaultRest } = defaults;

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
    options?: BoundHandlerOptions<CreateOptions<Args>>,
  ) =>
    createHandler<Args>(
      req,
      resolveDb(defaults, options),
      mergeHandlerOptions<CreateOptions<Args>>(defaults, options),
    );
};

export const bindDeleteHandler = (defaults: BindWriteHandlerDefaults) => {
  return (req: DeleteRequest, options?: BoundHandlerOptions<DeleteOptions>) =>
    deleteHandler(
      req,
      resolveDb(defaults, options),
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
      resolveDb(defaults, options),
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
      resolveDb(defaults, options),
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
      resolveDb(defaults, options),
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
      resolveDb(defaults, options),
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
      resolveDb(defaults, options),
      mergeHandlerOptions<GetManyReferenceOptions<Args>>(defaults, options),
    );
};

export const bindGetOneHandler = (defaults: BindHandlerDefaults) => {
  return <Args extends GetOneArgs>(
    req: GetOneRequest,
    options?: BoundHandlerOptions<GetOneOptions<Args>>,
  ) =>
    getOneHandler<Args>(
      req,
      resolveDb(defaults, options),
      mergeHandlerOptions<GetOneOptions<Args>>(defaults, options),
    );
};

export const bindUpdateHandler = (defaults: BindWriteHandlerDefaults) => {
  return <Args extends UpdateArgs>(
    req: UpdateRequest,
    options?: BoundHandlerOptions<UpdateOptions<Args>>,
  ) =>
    updateHandler<Args>(
      req,
      resolveDb(defaults, options),
      mergeHandlerOptions<UpdateOptions<Args>>(defaults, options),
    );
};

export const bindUpdateManyHandler = (defaults: BindWriteHandlerDefaults) => {
  return <Args extends UpdateArgs>(
    req: UpdateManyRequest,
    options?: BoundHandlerOptions<
      Omit<UpdateOptions<Args>, "columns" | "with" | "extras">
    >,
  ) =>
    updateManyHandler<Args>(
      req,
      resolveDb(defaults, options),
      mergeHandlerOptions<
        Omit<UpdateOptions<Args>, "columns" | "with" | "extras">
      >(defaults, options),
    );
};

export const bindDefaultHandler = (defaults: BindWriteHandlerDefaults) => {
  return (
    req: RaPayload,
    options?: BoundHandlerOptions<DefaultHandlerOptions>,
  ) =>
    defaultHandler(
      req,
      resolveDb(defaults, options),
      mergeHandlerOptions<DefaultHandlerOptions>(defaults, options),
    );
};
