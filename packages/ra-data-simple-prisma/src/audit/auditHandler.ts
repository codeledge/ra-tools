import { AuditOptions, AuditLogPayload, defaultAuditOptions } from "./types";
import { RaPayload } from "../Http";
import { objectDiff } from "deverything";
import { Identifier } from "react-admin";

export const auditHandler = async (
  request: RaPayload,
  options: AuditOptions,
  created?: any,
) => {
  const action = request.method.split(/(?=[A-Z])/)[0];
  const mergedOptions = {
    ...defaultAuditOptions,
    ...options,
  };

  //skip get and disabled actions
  if (action === "get" || mergedOptions.enabledForAction[action] === false) {
    return;
  }

  if (mergedOptions.enabledResources && !(request.model in mergedOptions)) {
    return;
  }

  if (request.method === "updateMany" || request.method === "deleteMany") {
    for (const id of request.params.ids) {
      await createAuditEntry(mergedOptions, request, id);
    }
  } else if ("id" in request.params) {
    await createAuditEntry(mergedOptions, request, request.params.id);
  } else if (created) {
    await createAuditEntry(mergedOptions, request, created.id);
  }
};

export const createAuditEntry = async (
  options: AuditOptions,
  request: RaPayload,
  id: Identifier,
) => {
  let payload: AuditLogPayload = {
    id,
  };

  if ("previousData" in request.params) {
    payload.previousData = request.params.previousData;
  }

  if ("data" in request.params) {
    payload.data = request.params.data;
  }

  if (payload.data && payload.previousData) {
    // TODO: rethink this crap, maybe make a flat diff, where nested props are in dot notation
    payload.diff = objectDiff(payload.previousData, payload.data);
  }

  const user = await options.authProvider.getIdentity();
  let data = {
    [options.columns.action]: request.method.split(/(?=[A-Z])/)[0], //createMany => create
    [options.columns.resource]: request.resource,
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
