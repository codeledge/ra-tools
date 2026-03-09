import { auditHandler } from "./audit/auditHandler";
import { AuditOptions } from "./audit/types";
import { getModel } from "./getModel";
import { DeleteManyRequest } from "./Http";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type DeleteManyOptions = {
  softDeleteField?: string;
  audit?: AuditOptions;
  debug?: boolean;
  primaryKey?: string;
};

export const deleteManyHandler = async (
  req: DeleteManyRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: DeleteManyOptions,
) => {
  const { ids } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const model = getModel(req, prismaClient);

  const deleted = options?.softDeleteField
    ? await model.updateMany({
        where: { [primaryKey]: { in: ids } },
        data: {
          [options?.softDeleteField]: new Date(),
        },
      })
    : await model.deleteMany({
        where: { [primaryKey]: { in: ids } },
      });

  if (options?.audit) {
    await auditHandler(req, options?.audit);
  }

  // react-admin expects the ids of the deleted rows
  // but only the count is returned from prisma deleteMany method, so...
  const response = { data: ids };

  return response;
};
