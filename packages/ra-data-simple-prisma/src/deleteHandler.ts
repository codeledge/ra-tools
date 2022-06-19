import { auditHandler } from "./audit/auditHandler";
import { AuditOptions } from "./audit/types";
import { DeleteRequest, Response } from "./Http";

export type DeleteOptions = {
  softDeleteField?: string;
  debug?: boolean;
};

export const deleteHandler = async <
  T extends { update: Function; delete: Function }
>(
  req: DeleteRequest,
  res: Response,
  table: T,
  options?: DeleteOptions,
  audit?: AuditOptions
) => {
  const { id } = req.body.params;

  const deleted = options?.softDeleteField
    ? await table.update({
        where: { id },
        data: {
          [options?.softDeleteField]: new Date(),
        },
      })
    : await table.delete({
        where: { id },
      });

  if (audit) {
    await auditHandler(audit, req);
  }

  return res.json({ data: deleted });
};
