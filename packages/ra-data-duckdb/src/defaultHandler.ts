import { type CreateOptions, createHandler } from "./createHandler";
import { type DeleteOptions, deleteHandler } from "./deleteHandler";
import { type DeleteManyOptions, deleteManyHandler } from "./deleteManyHandler";
import { DuckDBExecutor } from "./duckdb";
import { type GetListOptions, getListHandler } from "./getListHandler";
import { type GetManyOptions, getManyHandler } from "./getManyHandler";
import {
  type GetManyReferenceOptions,
  getManyReferenceHandler,
} from "./getManyReferenceHandler";
import { type ResourceToTableMap } from "./getTable";
import { type GetOneOptions, getOneHandler } from "./getOneHandler";
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
import { type UpdateOptions, updateHandler } from "./updateHandler";
import { updateManyHandler } from "./updateManyHandler";

export type DefaultHandlerOptions = {
  create?: CreateOptions;
  delete?: DeleteOptions;
  deleteMany?: DeleteManyOptions;
  getList?: GetListOptions;
  getMany?: GetManyOptions;
  getManyReference?: GetManyReferenceOptions;
  getOne?: GetOneOptions;
  resourceToTableMap?: ResourceToTableMap;
  update?: UpdateOptions;
};

const withResourceToTableMap = <T extends object>(
  handlerOptions: T | undefined,
  resourceToTableMap?: ResourceToTableMap,
) => ({
  ...(resourceToTableMap ? { resourceToTableMap } : {}),
  ...handlerOptions,
});

export const defaultHandler = async (
  req: RaPayload,
  db: DuckDBExecutor,
  options?: DefaultHandlerOptions,
) => {
  switch (req.method) {
    case "create": {
      return await createHandler(
        req as CreateRequest,
        db,
        withResourceToTableMap(options?.create, options?.resourceToTableMap),
      );
    }
    case "delete": {
      return await deleteHandler(
        req as DeleteRequest,
        db,
        withResourceToTableMap(options?.delete, options?.resourceToTableMap),
      );
    }
    case "deleteMany": {
      return deleteManyHandler(
        req as DeleteManyRequest,
        db,
        withResourceToTableMap(
          options?.deleteMany ?? options?.delete,
          options?.resourceToTableMap,
        ),
      );
    }
    case "getList": {
      return getListHandler(
        req as GetListRequest,
        db,
        withResourceToTableMap(options?.getList, options?.resourceToTableMap),
      );
    }
    case "getMany": {
      return getManyHandler(
        req as GetManyRequest,
        db,
        withResourceToTableMap(options?.getMany, options?.resourceToTableMap),
      );
    }
    case "getManyReference": {
      return getManyReferenceHandler(
        req as GetManyReferenceRequest,
        db,
        withResourceToTableMap(
          options?.getManyReference,
          options?.resourceToTableMap,
        ),
      );
    }
    case "getOne": {
      return getOneHandler(
        req as GetOneRequest,
        db,
        withResourceToTableMap(options?.getOne, options?.resourceToTableMap),
      );
    }
    case "update": {
      return await updateHandler(
        req as UpdateRequest,
        db,
        withResourceToTableMap(options?.update, options?.resourceToTableMap),
      );
    }
    case "updateMany": {
      return await updateManyHandler(
        req as UpdateManyRequest,
        db,
        withResourceToTableMap(options?.update, options?.resourceToTableMap),
      );
    }
    default:
      throw new Error("Invalid method");
  }
};
