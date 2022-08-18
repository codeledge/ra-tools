import { AuditOptions } from "./audit/types";
import { DeleteManyRequest, DeleteRequest, Response } from "./Http";
import { auditHandler } from "./audit/auditHandler";

export type DeleteManyOptions = {
  softDeleteField?: string;
  audit?: AuditOptions;
};

export const deleteManyHandler = async (
  req: DeleteManyRequest,
  res: Response,
  model: { updateMany: Function; deleteMany: Function },
  options?: DeleteManyOptions
) => {
  const { ids } = req.body.params;

  const deleted = options?.softDeleteField
    ? await model.updateMany({
        where: { id: { in: ids } },
        data: {
          [options?.softDeleteField]: new Date(),
        },
      })
    : await model.deleteMany({
        where: { id: { in: ids } },
      });

  if (options?.audit) {
    await auditHandler(req, options?.audit);
  }

  // react-admin expects the ids of the deleted rows
  // but only the count is returned from prisma deleteMany method, so...
  res.json({ data: ids });
};
