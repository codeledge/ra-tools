import { AuditOptions } from "./audit/types";
import { CreateRequest, Response } from "./Http";
import { auditHandler } from "./audit/auditHandler";

export const createHandler = async <T extends { create: Function }>(
  req: CreateRequest,
  res: Response,
  table: T,
  options?: {
    connect?: {
      [key: string]: string;
    };
  },
  audit?: AuditOptions
) => {
  const { data } = req.body.params;

  // Filter out any fields that are not in the schema
  Object.entries(data).forEach(([prop, value]) => {
    if (value === "") {
      delete data[prop];
    }
  });

  // transfor an array to a connect (many-to-many)
  // e.g. (handler)
  // createHandler(req, res, prismaClient.post, {
  //      connect: {
  //        tags: "id",
  //      },
  //    });
  // (data) tags: [1, 2, 3] => tags: { connect: {id: [1, 2, 3]} }
  Object.entries(data).forEach(([prop, value]) => {
    const foreignConnectKey = options?.connect?.[prop];
    if (foreignConnectKey) {
      data[prop] = {
        connect: Array.isArray(value)
          ? value.map((key) => ({ [foreignConnectKey]: key }))
          : { [foreignConnectKey]: value },
      };
    }
  });

  const created = await table.create({
    data,
  });

  if (audit) {
    await auditHandler(audit, req, created);
  }

  res.json({ data: created });
};
