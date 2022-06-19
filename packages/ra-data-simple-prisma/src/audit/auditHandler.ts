import { prisma } from "@prisma/client";
import { AuditActions, AuditOptions } from "./types";
import { Request } from "../Http";

export const auditHandler = async (options: AuditOptions, request: Request) => {
  const action = request.body.method.split(/(?=[A-Z])/)[0];
  if (action === "get") {
    return;
  }
  if (
    request.body.method === "updateMany" ||
    request.body.method === "deleteMany"
  ) {
    for (const id of request.body.params.ids) {
      //todo
    }
  } else {
    createAuditEntry(options, request);
  }

  return true;
};

const createAuditEntry = async (options: AuditOptions, request: Request) => {
  const table = prisma[options.tableName];
  let data = {
    [options.tableColumns.action]: request.body.method.split(/(?=[A-Z])/)[0], //createMany => create
    [options.tableColumns.resource]: request.body.resource,
    // [options.tableColumns.date]: new Date(),
    // [options.tableColumns.user]: options.user,
  };
  if ("id" in request.body.params) {
    data[options.tableColumns.id] = request.body.params.id.toString();
  }
  const created = await table.create({
    data,
  });
  return created;
};
