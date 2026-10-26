import { eq } from "drizzle-orm";
import { auditHandler } from "./audit/auditHandler";
import type { AuditOptions } from "./audit/types";
import type { DrizzleDatabase, ResourceToTableMap } from "./DrizzleTypes";
import { getPrimaryKeyColumn, getTable } from "./getTable";
import type { DeleteRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";

export type DeleteOptions = {
  softDeleteField?: string;
  debug?: boolean;
  audit?: AuditOptions;
  primaryKey?: string;
  resourceToTableMap?: ResourceToTableMap;
};

export const deleteHandler = async (
  req: DeleteRequest,
  db: DrizzleDatabase,
  options?: DeleteOptions,
) => {
  const drizzleTable = getTable(req, db, options?.resourceToTableMap);
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const primaryKeyColumn = getPrimaryKeyColumn(drizzleTable, primaryKey);

  const [deleted] = options?.softDeleteField
    ? await db
        .update(drizzleTable.table)
        .set({ [options.softDeleteField]: new Date() } as any)
        .where(eq(primaryKeyColumn, id))
        .returning()
    : await db
        .delete(drizzleTable.table)
        .where(eq(primaryKeyColumn, id))
        .returning();

  if (options?.debug) console.log("deleteHandler:deleted", deleted);

  if (options?.audit) {
    // NOTE: there is no "data" for the delete request so must be
    // "previousData", also makes sense semantically
    req.params.previousData = deleted;

    await auditHandler(req, options.audit, db);
  }

  return { data: mapPrimaryKeyToId(deleted ?? null, primaryKey) };
};
