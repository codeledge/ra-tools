import { AuditOptions } from "./audit/types";
import { Response, UpdateRequest } from "./Http";
import { auditHandler } from "./audit/auditHandler";
import { isNotField } from "./lib/isNotField";
import { isObject } from "./lib/isObject";

export type UpdateOptions = {
  skipFields?: string[]; //i.e. Json fields throw error if null is used in update, they would expect {} instead
  allowFields?: string[]; //fields that will not be checked if it's a relationship or not
  set?: {
    [key: string]: string;
  };
};

export const updateHandler = async <T extends { update: Function }>(
  req: UpdateRequest,
  res: Response,
  table: T,
  options?: UpdateOptions,
  audit?: AuditOptions
) => {
  const { id } = req.body.params;

  const data = Object.entries(req.body.params.data).reduce(
    (fields, [key, value]) => {
      if (isNotField(key)) return fields;

      //TODO: move this into `isNotField`
      //Remove relations, allow nested updates one day
      if (
        (!isObject(value) && !options?.skipFields?.includes(key)) ||
        options?.allowFields?.includes(key)
      )
        fields[key] = value;

      return fields;
    },
    {}
  );

  // transfor an array to a connect (many-to-many)
  // e.g. (handler)
  // updateHandler(req, res, prismaClient.post, {
  //      set: {
  //        tags: "id",
  //      },
  //    });
  // (data) tags: [1, 2, 3] => tags: { set: [{id: 1}, {id: 2}, {id: 3}]} }
  Object.entries(data).forEach(([prop, values]) => {
    const foreignConnectKey = options?.set?.[prop];
    if (foreignConnectKey && Array.isArray(values)) {
      data[prop] = {
        set: values.map((value) => ({ [foreignConnectKey]: value })),
      };
    }
  });

  const updated = await table.update({
    where: { id },
    data,
  });

  if (audit) {
    await auditHandler(audit, req);
  }

  return res.json({ data: updated });
};
