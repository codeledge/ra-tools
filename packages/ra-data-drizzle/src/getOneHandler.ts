import type {
  DrizzleDatabase,
  DrizzleQueryArgs,
  ResourceToTableMap,
} from "./DrizzleTypes";
import { getPrimaryKeyColumn, getTable } from "./getTable";
import type { GetOneRequest } from "./Http";
import { compact } from "./lib/compact";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type GetOneArgs = DrizzleQueryArgs;
// there is no where because it's always id based

export type GetOneOptions<Args extends GetOneArgs = GetOneArgs> = Args & {
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
  transform?: (row: any) => any | Promise<any>;
};

export const getOneHandler = async <Args extends GetOneArgs>(
  req: GetOneRequest,
  db: DrizzleDatabase,
  options?: GetOneOptions<Args>,
) => {
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  getPrimaryKeyColumn(drizzleTable, primaryKey);
  const where = { [primaryKey]: { eq: id } };

  if (options?.debug) console.log("getOneHandler:where", where);

  const row =
    (await drizzleTable.query.findFirst(
      compact({
        where,
        columns: options?.columns,
        with: options?.with,
        extras: options?.extras,
      }),
    )) ?? null;

  // TRANSFORM STAGE
  if (options?.debug) console.log("getOneHandler:beforeTransform", row);

  const transformedRow = options?.transform
    ? await options.transform(row)
    : row;

  if (options?.debug)
    console.log("getOneHandler:afterTransform", transformedRow);

  // RESPONSE STAGE
  return { data: mapPrimaryKeyToId(transformedRow, primaryKey) };
};
