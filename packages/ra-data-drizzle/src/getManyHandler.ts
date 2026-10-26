import type {
  DrizzleDatabase,
  DrizzleQueryArgs,
  ResourceToTableMap,
} from "./DrizzleTypes";
import { transformListRows } from "./getListHandler";
import { getPrimaryKeyColumn, getTable } from "./getTable";
import type { GetManyRequest } from "./Http";
import { compact } from "./lib/compact";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetManyArgs = DrizzleQueryArgs;

export type GetManyOptions<Args extends GetManyArgs = GetManyArgs> = Args & {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  transformRow?: (data: any) => any | Promise<any>;
  transformRows?: (rows: any[]) => any[] | Promise<any[]>;
};

export const getManyHandler = async <Args extends GetManyArgs>(
  req: GetManyRequest,
  db: DrizzleDatabase,
  options?: GetManyOptions<Args>,
) => {
  const { ids } = req.params;
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const primaryKey = options?.primaryKey ?? "id";
  getPrimaryKeyColumn(drizzleTable, primaryKey);

  // GET DATA
  const rows = await drizzleTable.query.findMany(
    compact({
      columns: options?.columns,
      with: options?.with,
      extras: options?.extras,
      where: { [primaryKey]: { in: ids } },
    }),
  );

  // TRANSFORM
  const data = await transformListRows(rows, options);

  return { data: mapPrimaryKeyToId(data, primaryKey) };
};
