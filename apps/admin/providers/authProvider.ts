import { AuthProvider } from "react-admin";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { permissionsConfig } from "./permissions";

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
    //console.info("checkAuth", params);
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
        id: session.userId!,
        email: session.user.email,
        fullName: session.user.name!,
        avatar: session.user.image!,
      });
    else return Promise.reject(new Error("identity not found"));
  },
  getPermissions: (_params) => {
    if (!session?.role) return Promise.reject(new Error("role not found"));
    return Promise.resolve(permissionsConfig[session.role]);
  },
});
