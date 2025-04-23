import { PermissionsConfig } from "../types/roles";

export const permissionsConfig: PermissionsConfig = {
  OWNER: [
    { action: "*", resource: "*" },
    {
      type: "deny",
      action: "show",
      resource: "adminUser",
      field: ["updatedAt"],
    },
  ], //admin can do anything
  COLLABORATOR: [
    //collaborator can do anything except edit, delete, create admin users
    { action: "*", resource: "*" },
    {
      type: "deny",
      action: ["edit", "delete", "create"],
      resource: "adminUser",
    },
  ],
  READER: [{ action: ["list", "show", "export"], resource: "*" }],
};
