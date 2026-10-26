import type { PgAsyncDatabase } from "drizzle-orm/pg-core";

/**
 * Any Drizzle v1 Postgres database (or transaction) created with `relations`,
 * e.g. `drizzle({ client, relations: defineRelations(schema) })`.
 */
export type DrizzleDatabase = PgAsyncDatabase<any, any>;

export type ResourceToTableMap = Record<string, string>;

/** Relational query (RQB v2) filter object, e.g. `{ title: { ilike: "%a%" } }` */
export type DrizzleWhere = Record<string, any>;

export type DrizzleOrderBy = Record<string, "asc" | "desc">;

export type DrizzleQueryArgs = {
  columns?: Record<string, boolean> | null;
  with?: Record<string, any> | null;
  extras?: Record<string, any> | null;
};
