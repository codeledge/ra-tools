import { NextApiRequest, NextApiResponse } from "next";
import {
  fetchActionToAction,
  ReactAdminFetchActions,
  Permissions,
  canAccess,
} from "ra-data-simple-prisma";
import { authProvider } from "./authProvider";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const extractAccessObjFromReq = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);

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

export const accessCheck = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const access = await extractAccessObjFromReq(req, res);
  if (!canAccess(access)) {
    return res.status(403).json({
      message:
        "You do not have permission to " +
        access.action +
        " this resource: " +
        access.resource,
    });
  }
};
