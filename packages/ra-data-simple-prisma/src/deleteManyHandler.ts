import { AuditOptions } from "./audit/types";
import { DeleteManyRequest, DeleteRequest, Response } from "./Http";
import { auditHandler } from "./audit/auditHandler";

export type DeleteManyOptions = {
  softDeleteField?: string;
};

export const deleteManyHandler = async <
  T extends { updateMany: Function; deleteMany: Function }
>(
  req: DeleteManyRequest,
  res: Response,
  table: T,
  options?: DeleteManyOptions,
  audit?: AuditOptions
) => {
  const { ids } = req.body.params;

  const deleted = options?.softDeleteField
    ? await table.updateMany({
        where: { id: { in: ids } },
        data: {
          [options?.softDeleteField]: new Date(),
        },
      })
    : await table.deleteMany({
        where: { id: { in: ids } },
      });

  if (audit) {
    await auditHandler(audit, req);
  }

  // react-admin expects the ids of the deleted rows
  // but only the count is returned from prisma deleteMany method, so...
  return res.json({ data: ids });
};
