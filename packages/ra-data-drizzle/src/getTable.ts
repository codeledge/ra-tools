import { getColumns, type Column } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { DrizzleDatabase, ResourceToTableMap } from "./DrizzleTypes";
import type { RaPayload } from "./Http";
import { RDDError } from "./RDDError";

export type DrizzleTable = {
  name: string;
  table: PgTable;
  columns: Record<string, Column>;
  relations: Record<string, any>;
  tablesRelations: Record<string, any>;
  query: any;
};

export const getTable = (
  req: Pick<RaPayload, "resource">,
  db: DrizzleDatabase,
  resourceToTableMap?: ResourceToTableMap,
): DrizzleTable => {
  const name = resourceToTableMap?.[req.resource] ?? req.resource;
  if (!name) throw new RDDError(`table name is empty`);

  const tablesRelations = (db as any)?._?.relations ?? {};
  const config = tablesRelations[name];
  const query = (db as any)?.query?.[name];

  if (!config || !query) {
    throw new RDDError(
      `No table found for "${name}". Make sure the table is exported in your schema and that you pass \`relations\` to drizzle(), e.g. drizzle({ client, relations: defineRelations(schema) })`,
    );
  }

  return {
    name,
    table: config.table,
    columns: getColumns(config.table) as Record<string, Column>,
    relations: config.relations ?? {},
    tablesRelations,
    query,
  };
};

export const getPrimaryKeyColumn = (
  drizzleTable: DrizzleTable,
  primaryKey: string,
) => {
  const column = drizzleTable.columns[primaryKey];
  if (!column) {
    throw new RDDError(
      `Primary key "${primaryKey}" is not a column of table "${drizzleTable.name}"`,
    );
  }
  return column;
};
