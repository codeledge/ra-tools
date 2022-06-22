import { AuditOptions, AuditOptionsFixed, defaultAuditOptions } from "./types";
import { Request, UpdateRequest } from "../Http";

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
    diff?: object;
  } = {
    id: id.toString(),
  };

  if ("previousData" in request.body.params) {
    payload.previousData = request.body.params.previousData;
  }

  if ("data" in request.body.params) {
    payload.data = request.body.params.data;
  }

  if (payload.data && payload.previousData) {
    payload.diff = objectDiff(payload.data, payload.previousData);
  }

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

const objectDiff = (obj1, obj2) => {
  var ret = {};
  for (var i in obj2) {
    if (!obj1.hasOwnProperty(i) || obj2[i] !== obj1[i]) {
      ret[i] = obj2[i];
    }
  }
  return ret;
};
