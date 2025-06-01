import { AuthProvider } from "react-admin";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { permissionsConfig } from "./permissions";
import { canAccess, Action, actions } from "ra-data-simple-prisma";

export const authProvider = (session?: Session | null): AuthProvider => ({
  login: (_params) => {
    //console.info("login", params);
    return Promise.resolve();
  },
  checkError: (_error) => {
    //console.info("checkError", error);
    return Promise.resolve();
  },
  checkAuth: (_params) => {
    // console.info("checkAuth", _params, session);
    if (session) return Promise.resolve();
    return Promise.reject(new Error("Invalid session"));
  },
  logout: async (params) => {
    //console.info("logout", params);
    //the callback is called again on login screen mount?
    if (params === null) await signOut();
    return Promise.resolve();
  },
  getIdentity: () => {
    if (session?.user)
      return Promise.resolve({
        id: session.user.userId,
        email: session.user.email,
        fullName: session.user.name,
        avatar: session.user.image,
        role: session.user.role,
      });
    else return Promise.reject(new Error("identity not found"));
  },
  getPermissions: (_params) => {
    // console.info("getPermissions", _params, session);
    if (!session?.user.role) return Promise.reject(new Error("role not found"));
    return Promise.resolve(permissionsConfig[session.user.role]);
  },
  canAccess: async ({
    resource,
    record,
    action: actionString,
  }: {
    resource: string;
    record?: any;
    action: string;
  }) => {
    // Cast default string action to Action type
    const action = actionString as Action;
    if (!actions.includes(action))
      return Promise.reject(new Error("invalid action"));
    if (!session?.user.role) return Promise.reject(new Error("role not found"));
    const permissions = permissionsConfig[session.user.role];

    return canAccess({ resource, record, action, permissions });
  },
});
