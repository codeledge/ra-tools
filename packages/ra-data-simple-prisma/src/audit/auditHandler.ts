import { prisma } from "@prisma/client";
import { AuditOptions, defaultAuditOptions } from "./types";
import { Request } from "../Http";

export const auditHandler = async (
  options: AuditOptions,
  request: Request,
  created?: any
) => {
  const action = request.body.method.split(/(?=[A-Z])/)[0];
  options = { ...defaultAuditOptions, ...options, };

  if (action === "get") {
    return;
  }
  if (
    request.body.method === "updateMany" ||
    request.body.method === "deleteMany"
  ) {
    for (const id of request.body.params.ids) {
      await createAuditEntry(options, request, id);
    }
  } else if ("id" in request.body.params) {
    await createAuditEntry(options, request, request.body.params.id);
  } else if (created) {
    await createAuditEntry(options, request, created.id);
  }

  return true;
};

const createAuditEntry = async (
  options: AuditOptions,
  request: Request,
  id: any
) => {
  let data = {
    [options.tableColumns.action]: request.body.method.split(/(?=[A-Z])/)[0], //createMany => create
    [options.tableColumns.resource]: request.body.resource,
    [options.tableColumns.payload]: JSON.stringify({
      id: id.toString(),
    }),
    // [options.tableColumns.date]: new Date(),
    // [options.tableColumns.author]: {
    //   connect: { id: request.body. },
    // },
  };

  const created = await options.table.create({
    data,
  });
  return created;
};
