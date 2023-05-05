import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import {
  fetchActionToAction,
  ReactAdminFetchActions,
  Permissions,
} from "ra-data-simple-prisma";
import { authProvider } from "../providers/authProvider";

export const extractAccessObjFromReq = async (req: NextApiRequest) => {
  const session = await getSession({ req });

  //check permissions
  const permissions: Permissions<string> = await authProvider(
    session
  ).getPermissions(null);

  //convert getList to list, and updateMany to edit
  const method = req.body.method as ReactAdminFetchActions;
  const action = fetchActionToAction[method];

  const resource: string = req.body.model ?? req.body.resource; //model can be undefined

  return { permissions, action, resource };
};
