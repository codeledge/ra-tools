import { PlainObject } from "deverything";
import { AuthProvider, Identifier } from "react-admin";

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
  addRecordToPayloadOnDelete?: boolean; // if true, the current record will be added to the payload for operations where data is not sent from client (i.e. delete)
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

export type AuditLogPayload = {
  id: Identifier;
  data?: PlainObject;
  previousData?: PlainObject;
};
