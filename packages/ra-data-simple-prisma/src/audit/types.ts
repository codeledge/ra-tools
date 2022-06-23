// import { UserIdentity } from "react-admin";

import { AuthProvider } from "react-admin";

export type AuditOptions = {
  model: { create: Function };
  authProvider: AuthProvider;
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
    author: "author",
  },
  enabledForAction: {
    create: true,
    update: true,
    delete: true,
  },
};

export type AuditActions = "create" | "update" | "delete";
