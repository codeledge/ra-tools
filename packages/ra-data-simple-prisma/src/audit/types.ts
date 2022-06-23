// import { UserIdentity } from "react-admin";

export type AuditOptions = {
  model?: { create: Function };
  authProvider?: any;
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

export type AuditOptionsFixed = {
  model: { create: Function };
  authProvider: any; //{ getIdentity: Promise<UserIdentity> };
  columns: {
    id: string;
    date: string;
    resource: string;
    action: string;
    payload: string;
    author: string;
  };
  enabledForAction: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  enabledResources?: string[];
};

export const defaultAuditOptions: AuditOptions = {
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
