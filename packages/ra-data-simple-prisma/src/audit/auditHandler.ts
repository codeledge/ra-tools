import { AuditOptions, AuditOptionsFixed, defaultAuditOptions } from "./types";
import { Request } from "../Http";

export const auditHandler = async (
  request: Request,
  options: AuditOptions,
  created?: any
) => {
  const action = request.body.method.split(/(?=[A-Z])/)[0];
  const mergedOptions = {
    ...defaultAuditOptions,
    ...options,
  } as AuditOptionsFixed;

  if (action === "get") {
    return;
  }

  if (
    request.body.method === "updateMany" ||
    request.body.method === "deleteMany"
  ) {
    for (const id of request.body.params.ids) {
      await createAuditEntry(mergedOptions, request, id);
    }
  } else if ("id" in request.body.params) {
    await createAuditEntry(mergedOptions, request, request.body.params.id);
  } else if (created) {
    await createAuditEntry(mergedOptions, request, created.id);
  }

  return true;
};

const createAuditEntry = async (
  options: AuditOptionsFixed,
  request: Request,
  id: any
) => {
  let payload: {
    id: string;
    data?: object;
    previousData?: object;
  } = {
    id: id.toString(),
  };

  // if (isSqlite) {
  //   payload = JSON.stringify(payload);
  // }

  const user = await options.authProvider.getIdentity();
  let data = {
    [options.columns.action]: request.body.method.split(/(?=[A-Z])/)[0], //createMany => create
    [options.columns.resource]: request.body.resource,
    [options.columns.payload]: payload,
    [options.columns.author]: {
      connect: { id: user.id },
    },
  };

  const created = await options.model.create({
    data,
  });
  return created;
};
