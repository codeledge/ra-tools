import { AuditOptions } from "./audit/types";
import { Response, UpdateRequest } from "./Http";
import { auditHandler } from "./audit/auditHandler";
import { isNotField } from "./lib/isNotField";
import { isObject } from "./lib/isObject";

export type UpdateArgs = {
  include?: object | null;
  select?: object | null;
};

export type UpdateOptions<Args extends UpdateArgs = UpdateArgs> = {
  select?: Args["select"];
  include?: Args["include"];
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
  allowJsonUpdate?: {
    [key: string]: boolean;
  };
  audit?: AuditOptions;
};

export const reduceData = (data, options: UpdateOptions) => {
  return Object.entries(data).reduce((fields, [key, value]) => {
    if (isNotField(key)) return fields;
    if (options?.skipFields?.[key]) return fields;

    // transform an array to a connect (many-to-many)
    // when the key is declared via 'set' option.
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
      } else {
        // Assign the array value directly if the key is not declared via 'set' option
        fields[key] = value;
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
  }, {});
};

export const updateHandler = async <Args extends UpdateArgs>(
  req: UpdateRequest,
  res: Response,
  model: { update: Function },
  options?: UpdateOptions<Args>
) => {
  const { id } = req.body.params;

  const data = reduceData(req.body.params.data, options);

  if (options?.debug) {
    console.log("updateHandler:data", data);
  }

  const updated = await model.update({
    where: { id },
    data,
    select: options?.select ?? undefined,
    include: options?.include ?? undefined,
  });

  if (options?.audit) {
    await auditHandler(req, options?.audit);
  }

  res.json({ data: updated });
};
