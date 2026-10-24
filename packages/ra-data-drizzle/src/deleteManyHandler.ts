import { inArray } from "drizzle-orm";
import { auditHandler } from "./audit/auditHandler";
import type { AuditOptions } from "./audit/types";
import type { DrizzleDatabase, ResourceToTableMap } from "./DrizzleTypes";
import { getPrimaryKeyColumn, getTable } from "./getTable";
import type { DeleteManyRequest } from "./Http";

export type DeleteManyOptions = {
  softDeleteField?: string;
  audit?: AuditOptions;
  debug?: boolean;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const deleteManyHandler = async (
  req: DeleteManyRequest,
  db: DrizzleDatabase,
  options?: DeleteManyOptions,
) => {
  const { ids } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const primaryKeyColumn = getPrimaryKeyColumn(drizzleTable, primaryKey);

  const affected = options?.softDeleteField
    ? await db
        .update(drizzleTable.table)
        .set({ [options.softDeleteField]: new Date() } as any)
        .where(inArray(primaryKeyColumn, ids))
        .returning()
    : await db
        .delete(drizzleTable.table)
        .where(inArray(primaryKeyColumn, ids))
        .returning();

  if (options?.debug) console.log("deleteManyHandler:affected", affected);

  if (options?.audit) {
    // returning() gives the rows as they were (delete) or with the soft delete date
    await auditHandler(req, options.audit, db, undefined, {
      rows: affected as any[],
      primaryKey,
    });
  }

  // react-admin expects the ids of the deleted rows
  return { data: (affected as any[]).map((row) => row[primaryKey]) };
};
