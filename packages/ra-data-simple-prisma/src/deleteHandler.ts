import { auditHandler } from "./audit/auditHandler";
import { AuditOptions } from "./audit/types";
import { getModel } from "./getModel";
import { DeleteRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type DeleteOptions = {
  softDeleteField?: string;
  debug?: boolean;
  audit?: AuditOptions;
  primaryKey?: string;
};

// NOTE: generic type W is not used in this function yet

export const deleteHandler = async <
  W extends {
    include?: object | null;
    select?: object | null;
    where?: object | null;
  },
>(
  req: DeleteRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: DeleteOptions,
) => {
  const model = getModel(req, prismaClient);
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";

  const deleted = options?.softDeleteField
    ? await model.update({
        where: { [primaryKey]: id },
        data: {
          [options.softDeleteField]: new Date(),
        },
      })
    : await model.delete({
        where: { [primaryKey]: id },
      });

  if (options?.audit) {
    if (options?.audit.addRecordToPayloadOnDelete) {
      req.params.previousData = deleted; // note there is no "data" for the delete operation so must be "previousData"
    }
    await auditHandler(req, options?.audit);
  }

  const response = { data: mapPrimaryKeyToId(deleted, primaryKey) };

  return response;
};
