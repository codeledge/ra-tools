import { eq } from "drizzle-orm";
import { auditHandler } from "./audit/auditHandler";
import type { AuditOptions } from "./audit/types";
import type {
  DrizzleDatabase,
  DrizzleQueryArgs,
  ResourceToTableMap,
} from "./DrizzleTypes";
import { getPrimaryKeyColumn, getTable } from "./getTable";
import type { UpdateRequest } from "./Http";
import { refetchRow } from "./lib/refetchRow";
import { toWriteData } from "./lib/toWriteData";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type UpdateArgs = DrizzleQueryArgs;

export type UpdateOptions<Args extends UpdateArgs = UpdateArgs> = Args & {
  debug?: boolean;
  skipFields?: {
    [key: string]: boolean;
  };
  allowOnlyFields?: {
    [key: string]: boolean;
  };
  audit?: AuditOptions;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const updateHandler = async <Args extends UpdateArgs>(
  req: UpdateRequest,
  db: DrizzleDatabase,
  options?: UpdateOptions<Args>,
) => {
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const primaryKeyColumn = getPrimaryKeyColumn(drizzleTable, primaryKey);

  const data = toWriteData(req.params.data, drizzleTable, {
    action: "update",
    primaryKey,
    skipFields: options?.skipFields,
    allowOnlyFields: options?.allowOnlyFields,
  });

  if (options?.debug) {
    console.log("updateHandler:data", data);
  }

  const [updated] = Object.keys(data).length
    ? await db
        .update(drizzleTable.table)
        .set(data as any)
        .where(eq(primaryKeyColumn, id))
        .returning()
    : // nothing to update (drizzle throws on an empty set), just read the row back
      [await drizzleTable.query.findFirst({ where: { [primaryKey]: { eq: id } } })];

  const row = await refetchRow(drizzleTable, updated, primaryKey, options);

  if (options?.audit) {
    await auditHandler(req, options.audit, db);
  }

  return { data: mapPrimaryKeyToId(row ?? null, primaryKey) };
};
