import type {
  DrizzleDatabase,
  DrizzleQueryArgs,
  DrizzleWhere,
  ResourceToTableMap,
} from "./DrizzleTypes";
import { extractOrderBy } from "./extractOrderBy";
import { extractSkipTake } from "./extractSkipTake";
import { extractWhere, type FilterMode, mergeWhere } from "./extractWhere";
import { transformListRows } from "./getListHandler";
import { getTable } from "./getTable";
import type { GetManyReferenceRequest } from "./Http";
import { compact } from "./lib/compact";
import { countRows } from "./lib/countRows";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetManyReferenceArgs = DrizzleQueryArgs & {
  where?: DrizzleWhere | null;
};

export type GetManyReferenceOptions<
  Args extends GetManyReferenceArgs = GetManyReferenceArgs,
> = Args & {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  transformRow?: (data: any) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
  filterMode?: FilterMode;
};

export const getManyReferenceHandler = async <
  Args extends GetManyReferenceArgs,
>(
  req: GetManyReferenceRequest,
  db: DrizzleDatabase,
  options?: GetManyReferenceOptions<Args>,
) => {
  const { id, target } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);

  const where = mergeWhere(
    { [target]: { eq: id } },
    extractWhere(req, { filterMode: options?.filterMode }),
    options?.where,
  );

  const { skip, take } = extractSkipTake(req);

  // GET DATA
  const [rows, total] = await Promise.all([
    drizzleTable.query.findMany(
      compact({
        columns: options?.columns,
        with: options?.with,
        extras: options?.extras,
        where,
        orderBy: extractOrderBy(req),
        offset: skip,
        limit: take,
      }),
    ),
    countRows(db, drizzleTable, where),
  ]);

  // TRANSFORM
  const data = await transformListRows(rows, options);

  return { data: mapPrimaryKeyToId(data, primaryKey), total };
};
