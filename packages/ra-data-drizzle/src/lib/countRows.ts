import { relationsFilterToSQL } from "drizzle-orm";
import type { DrizzleDatabase, DrizzleWhere } from "../DrizzleTypes";
import type { DrizzleTable } from "../getTable";

/**
 * Counts rows matching a relational query `where`, compiled with the very same
 * function drizzle uses internally for `db.query.*.findMany({ where })`.
 */
export const countRows = async (
  db: DrizzleDatabase,
  drizzleTable: DrizzleTable,
  where?: DrizzleWhere,
) => {
  const filter = where
    ? relationsFilterToSQL(
        drizzleTable.table,
        where,
        drizzleTable.relations,
        drizzleTable.tablesRelations,
      )
    : undefined;

  return Number(await db.$count(drizzleTable.table, filter));
};
