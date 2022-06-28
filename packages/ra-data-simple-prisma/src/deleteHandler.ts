import { AuditOptions } from "./audit/types";
import { DeleteRequest, Response } from "./Http";
import { auditHandler } from "./audit/auditHandler";

export type DeleteOptions = {
  softDeleteField?: string;
  debug?: boolean;
  audit?: AuditOptions;
};

export const deleteHandler = async <
  T extends { update: Function; delete: Function }
>(
  req: DeleteRequest,
  res: Response,
  table: T,
  options?: DeleteOptions
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

  if (options?.audit) {
    await auditHandler(req, options?.audit);
  }

  res.json({ data: deleted });
};
