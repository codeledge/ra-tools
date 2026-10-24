import { PlainObject } from "deverything";
import type { PgTable } from "drizzle-orm/pg-core";
import { AuthProvider, Identifier } from "react-admin";

export type AuditOptions = {
  /** The drizzle table where audit logs are inserted */
  table: PgTable;
  authProvider: AuthProvider;
  /** Keys (TS property names) of the audit table columns */
  columns?: {
    id?: string;
    date?: string;
    resource?: string;
    action?: string;
    payload?: string;
    author?: string;
  };
  enabledForAction?: {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  enabledResources?: string[];
};

export const defaultAuditOptions: Pick<
  AuditOptions,
  "columns" | "enabledForAction"
> = {
  columns: {
    id: "id",
    date: "date",
    resource: "resource",
    action: "action",
    payload: "payload",
    author: "authorId",
  },
  enabledForAction: {
    create: true,
    update: true,
    delete: true,
  },
};

export type AuditActions = "create" | "update" | "delete";

export type AuditLogPayload = {
  id: Identifier;
  data?: PlainObject;
  previousData?: PlainObject;
};
