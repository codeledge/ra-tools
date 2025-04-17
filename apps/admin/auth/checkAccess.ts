import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/authOptions";
import {
  RaPayload,
  ReactAdminFetchActions,
  canAccess,
  Permissions,
  fetchActionToAction,
} from "ra-data-simple-prisma";
import { authProvider } from "../providers/authProvider";

export const checkAccess = async (payload: RaPayload) => {
  const session = await getServerSession(authOptions);
  if (!session)
    throw {
      message: "Unauthorized",
      status: 401,
    };

  const sessionAuthProvider = authProvider(session);

  const method = payload.method as ReactAdminFetchActions;
  const action = fetchActionToAction[method];

  const resource = payload.model ?? payload.resource; //model can be undefined

  const canAccess = await sessionAuthProvider.canAccess?.({
    action,
    resource,
  });

  if (!canAccess) {
    throw {
      message:
        "You do not have permission to " +
        action +
        " this resource: " +
        resource,
      status: 403,
    };
  }

  return { action, resource, sessionAuthProvider, session };
};
