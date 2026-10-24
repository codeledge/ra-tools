import { inArray } from "drizzle-orm";
import { auditHandler } from "./audit/auditHandler";
import type { DrizzleDatabase } from "./DrizzleTypes";
import { getPrimaryKeyColumn, getTable } from "./getTable";
import type { UpdateManyRequest } from "./Http";
import { toWriteData } from "./lib/toWriteData";
import type { UpdateArgs, UpdateOptions } from "./updateHandler";

export const updateManyHandler = async <Args extends UpdateArgs>(
  req: UpdateManyRequest,
  db: DrizzleDatabase,
  options?: Omit<UpdateOptions<Args>, "columns" | "with" | "extras">,
) => {
  const { ids } = req.params;
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
    console.log("updateManyHandler:data", data);
  }

  const rowsToUpdate = options?.audit
    ? await db
        .select()
        .from(drizzleTable.table)
        .where(inArray(primaryKeyColumn, ids))
    : undefined;

  if (Object.keys(data).length) {
    await db
      .update(drizzleTable.table)
      .set(data as any)
      .where(inArray(primaryKeyColumn, ids));
  }

  if (options?.audit) {
    await auditHandler(req, options.audit, db, undefined, {
      rows: rowsToUpdate,
      primaryKey,
    });
  }

  //react-admin expects a array of ids as response
  return { data: ids };
};
