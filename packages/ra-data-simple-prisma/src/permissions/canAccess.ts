import isMatch from "lodash/isMatch";
import { Action, Permission, Permissions } from "./types";

export type ReactAdminFetchActions =
  | "getOne"
  | "create"
  | "update"
  | "getList"
  | "getMany"
  | "getManyReference"
  | "updateMany"
  | "delete"
  | "deleteMany";

export const fetchActionToAction: Record<ReactAdminFetchActions, Action> = {
  getOne: "show",
  create: "create",
  getList: "list",
  getMany: "list",
  getManyReference: "list",
  update: "edit",
  updateMany: "edit",
  delete: "delete",
  deleteMany: "delete",
};

export const canAccess = ({
  action,
  permissions,
  resource,
  record,
  field,
}: {
  action: Action;
  permissions: Permissions<string>;
  resource: string;
  record?: any;
  field?: string;
}): boolean => {
  if (!permissions || permissions.length === 0 || !resource) return false;

  // Support resource.field pattern
  if (!field && resource.includes(".")) {
    const parts = resource.split(".");
    resource = parts[0];
    field = parts.slice(1).join(".");
  }

  // if any deny permission matches => false
  for (const permission of permissions.filter(
    (p) => p !== null && p.type === "deny"
  )) {
    if (matchTarget(permission, resource, action, record, field)) {
      return false;
    }
  }

  // if any allow permission matches => true
  for (const permission of permissions.filter(
    (p) => p !== null && p.type !== "deny"
  )) {
    if (matchTarget(permission, resource, action, record, field)) {
      return true;
    }
  }

  return false;
};

const matchTarget = (
  permission: Permission<string>,
  resource: string,
  action: Action,
  record?: any,
  field?: string
) => {
  if (permission === null || !matchWildcard(permission.resource, resource)) {
    return false;
  }
  if (Array.isArray(permission.action) && !permission.action.includes(action)) {
    return false;
  }
  if (
    typeof permission.action === "string" &&
    permission.action !== "*" &&
    permission.action !== action
  ) {
    return false;
  }
  if (permission.record && record) {
    if (!isMatch(record, permission.record)) {
      return false;
    }
  }
  if (permission.field && field) {
    if (Array.isArray(permission.field) && !permission.field.includes(field)) {
      return false;
    }
    if (typeof permission.field === "string" && permission.field !== field) {
      return false;
    }
  }
  return true;
};

const matchWildcard = (pattern: string, resource: string) => {
  if (pattern === "*") {
    return true;
  }
  if (pattern === resource) {
    return true;
  }
  if (pattern.endsWith("*")) {
    return resource.startsWith(pattern.slice(0, -1));
  }
  return false;
};
