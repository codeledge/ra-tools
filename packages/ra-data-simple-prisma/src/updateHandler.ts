import { AuditOptions } from "./audit/types";
import { Response, UpdateRequest } from "./Http";
import { auditHandler } from "./audit/auditHandler";
import { isNotField } from "./lib/isNotField";
import { isObject } from "./lib/isObject";

export type UpdateOptions = {
  debug?: boolean;
  skipFields?: {
    [key: string]: boolean;
  };
  set?: {
    [key: string]: string;
  };
  allowNestedUpdate?: {
    [key: string]: boolean;
  };
  allowNestedUpsert?: {
    [key: string]: boolean;
  };
  audit?: AuditOptions;
  allowJsonUpdate?: {
    [key: string]: boolean;
  };
};

export const updateHandler = async (
  req: UpdateRequest,
  res: Response,
  model: { update: Function },
  options?: UpdateOptions
) => {
  const { id } = req.body.params;

  const data = Object.entries(req.body.params.data).reduce(
    (fields, [key, value]) => {
      if (isNotField(key)) return fields;
      if (options?.skipFields?.[key]) return fields;

      // transfor an array to a connect (many-to-many)
      // e.g. (handler)
      // updateHandler(req, res, prismaClient.post, {
      //      set: {
      //        tags: "id",
      //      },
      //    });
      // (data) tags: [1, 2, 3] => tags: { set: [{id: 1}, {id: 2}, {id: 3}]} }
      if (Array.isArray(value)) {
        const foreignConnectKey = options?.set?.[key];
        if (foreignConnectKey) {
          fields[key] = {
            set: value.map((value) => ({ [foreignConnectKey]: value })),
          };
        }
      } else if (isObject(value)) {
        if (options?.allowNestedUpdate?.[key]) {
          //Allow relations update
          fields[key] = {
            update: {
              data: value,
            },
          };
        }
        if (options?.allowNestedUpsert?.[key]) {
          //Allow relations upsert
          fields[key] = {
            upsert: {
              create: value,
              update: value,
            },
          };
        }
        if (options?.allowJsonUpdate?.[key]) {
          //Allow json type update
          fields[key] = value;
        }
      } else {
        fields[key] = value;
      }

      return fields;
    },
    {}
  );

  if (options?.debug) {
    console.log("updateHandler:data", data);
  }

  const updated = await model.update({
    where: { id },
    data,
  });

  if (options?.audit) {
    await auditHandler(req, options?.audit);
  }

  res.json({ data: updated });
};
