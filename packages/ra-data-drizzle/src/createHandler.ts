import { auditHandler } from "./audit/auditHandler";
import type { AuditOptions } from "./audit/types";
import type {
  DrizzleDatabase,
  DrizzleQueryArgs,
  ResourceToTableMap,
} from "./DrizzleTypes";
import { getTable } from "./getTable";
import type { CreateRequest } from "./Http";
import { refetchRow } from "./lib/refetchRow";
import { toWriteData } from "./lib/toWriteData";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type CreateArgs = DrizzleQueryArgs;

export type CreateOptions<Args extends CreateArgs = CreateArgs> = Args & {
  allowOnlyFields?: {
    [key: string]: boolean;
  };
  audit?: AuditOptions;
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const createHandler = async <Args extends CreateArgs>(
  req: CreateRequest,
  db: DrizzleDatabase,
  options?: CreateOptions<Args>,
) => {
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const primaryKey = options?.primaryKey ?? "id";

  const data = toWriteData(req.params.data, drizzleTable, {
    action: "create",
    primaryKey,
    allowOnlyFields: options?.allowOnlyFields,
  });

  if (options?.debug) console.log("createHandler:data", data);

  const [inserted] = await db
    .insert(drizzleTable.table)
    .values(data as any)
    .returning();

  const created = await refetchRow(drizzleTable, inserted, primaryKey, options);

  if (options?.debug) console.log("createHandler:created", created);

  const mapped = mapPrimaryKeyToId(created, primaryKey);

  if (options?.audit) {
    await auditHandler(req, options.audit, db, mapped);
  }

  return { data: mapped };
};
