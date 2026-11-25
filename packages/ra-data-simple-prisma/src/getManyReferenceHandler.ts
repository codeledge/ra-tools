import { extractOrderBy } from "./extractOrderBy";
import { extractRequiredSkipTake } from "./extractRequiredSkipTake";
import { extractWhere, FilterMode } from "./extractWhere";
import { getModel, type ResourceToModelMap } from "./getModel";
import { GetManyReferenceRequest } from "./Http";
import { setSafePath } from "./lib/safePath";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type GetManyReferenceArgs = {
  include?: object | null;
  select?: object | null;
  omit?: object | null;
};

export type GetManyReferenceOptions<
  Args extends GetManyReferenceArgs = GetManyReferenceArgs,
> = Args & {
  debug?: boolean;
  primaryKey?: string;
  resourceToModelMap?: ResourceToModelMap;
  /** Resource this route serves; requests naming another resource are rejected. */
  resource?: string;
  transformRow?: (data: any) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
  filterMode?: FilterMode;
  /** Field paths the client may filter on; unset allows every field. */
  filterableFields?: string[];
  /** Field paths the client may sort on; unset allows every field. */
  sortableFields?: string[];
  /** Largest perPage a client may request (default 1000). */
  maxPerPage?: number;
};

export const getManyReferenceHandler = async <
  Args extends GetManyReferenceArgs,
>(
  req: GetManyReferenceRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: GetManyReferenceOptions<Args>,
) => {
  const { id, target } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const model = getModel(
    req,
    prismaClient,
    options?.resourceToModelMap,
    options?.resource,
  );
  const orderBy = extractOrderBy(req, {
    sortableFields: options?.sortableFields,
  });

  const requestWhere = extractWhere(req, {
    filterMode: options?.filterMode,
    filterableFields: options?.filterableFields,
  });

  // The reference scope must never be overridden by the request filter, so
  // the two are combined with AND instead of being shallow-merged.
  const scope = {};
  setSafePath(scope, target, id, "getManyReferenceHandler");
  const where = Object.keys(requestWhere).length
    ? { AND: [scope, requestWhere] }
    : scope;

  const { skip, take } = extractRequiredSkipTake(req, {
    maxPerPage: options?.maxPerPage,
  });

  // GET DATA

  const [rows, total] = await Promise.all([
    model.findMany({
      include: options?.include,
      select: options?.select,
      omit: options?.omit,
      where,
      orderBy,
      skip,
      take,
    }),
    model.count({ where }),
  ]);

  // TRANSFORM
  let data = rows;

  if (options?.transformRow) {
    data = await Promise.all(data.map(options.transformRow));
  }

  if (options?.transformRows) {
    data = await options.transformRows(data);
  }

  const response = { data: mapPrimaryKeyToId(data, primaryKey), total };

  return response;
};
