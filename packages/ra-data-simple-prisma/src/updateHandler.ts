import { AuditOptions } from "./audit/types";
import { UpdateRequest } from "./Http";
import { auditHandler } from "./audit/auditHandler";
import { isNotField } from "./lib/isNotField";
import { firstValue } from "./lib/firstValue";
import { firstKey } from "./lib/firstKey";
import { isObject, isString } from "deverything";

export type UpdateArgs = {
  include?: object | null;
  select?: object | null;
};

// export type UpdateImplicitConnectionShortcut = {
//   [key: string]: string;
// };

// export type UpdateImplicitConnection = {
//   [key: string]: {
//     [key: string]: string;
//   };
// };

// export type CreateExplicitConnection = {
//   [key: string]: {
//     [key: string]: {
//       [key: string]: string;
//     };
//   };
// };

export type UpdateOptions<Args extends UpdateArgs = UpdateArgs> = Args & {
  debug?: boolean;
  skipFields?: {
    [key: string]: boolean;
  };
  set?: {
    // TODO: Make this work UpdateImplicitConnectionShortcut | UpdateImplicitConnection | CreateExplicitConnection;
    [key: string]:
      | string
      | {
          [key: string]:
            | string
            | {
                [key: string]: string;
              };
        };
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

    const foreignSet = options?.set?.[key];
    if (foreignSet) {
      if (isString(foreignSet)) {
        // transform an array to a connect (many-to-many)
        // when the key is declared via 'set' option.
        // e.g. (handler)
        // updateHandler(req, res, prismaClient.post, {
        //      set: {
        //        tags: "id",
        //      },
        //    });
        // (data) tags: [1, 2, 3] => tags: { set: [{id: 1}, {id: 2}, {id: 3}]} }

        // foreignSet => id

        fields[key] = {
          set: (value as number[]).map((value) => ({
            [foreignSet]: value,
          })),
        };
      }

      if (isObject(foreignSet)) {
        if (isObject(firstValue(foreignSet))) {
          //foreignSet => { postToMediaRels: { media: "id" } }

          // transform an array to a connect (EXPLICIT many-to-many)
          // e.g. (handler)
          // createHandler(req, res, prismaClient.post, {
          //      set: {
          //        mediaIds: {
          //          postToMediaRels: {
          //            media: "id",
          //          }
          //        },
          //      },
          //    });
          // (data) mediaIds: [1, 2, 3] => postToMediaRels: { deleteMany: {}, create: [{media: {connect: {id: 1}}}, {media: {connect: {id: 2}}}, {media: {connect: {id: 3}}}] }

          const foreignCreateKey = firstKey(foreignSet); // => postToMediaRels
          const foreignConnectObject = foreignSet[foreignCreateKey]; // => {media: "id"}
          const foreignConnectModel = firstKey(foreignConnectObject); // => media
          const foreignConnectField = foreignConnectObject[foreignConnectModel]; // => id

          fields[foreignCreateKey] = {
            deleteMany: {}, // OK not perfect because now the "created at" will update for all rels
            create: (value as any[]).map((val) => ({
              [foreignConnectModel]: {
                connect: { [foreignConnectField]: val },
              },
            })),
          };
        } else {
          //foreignSet => { tags: "id" }

          // transform an array to a connect (IMPLICIT many-to-many)
          // e.g. (handler)
          // createHandler(req, res, prismaClient.post, {
          //      set: {
          //        tagIds: {
          //          tags: "id",
          //        },
          //      },
          //    });
          // (data) tagIds: [1, 2, 3] => tags: { connect: [{id: 1}, {id: 2}, {id: 3}] }

          const foreignConnectKey = firstKey(foreignSet); // => tags
          const foreignConnectField = foreignSet[foreignConnectKey] as string; // => id

          fields[foreignConnectKey] = {
            set: (value as any[]).map((val) => ({
              [foreignConnectField]: val,
            })),
          };
        }

        // remove this data now that it has been transformed into another property
        delete fields[key]; //delete mediaIds/tagIds: [1, 2, 3]
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
      // could be an array and get here if not consumed by foreignSet
      fields[key] = value;
    }

    return fields;
  }, {});
};

export const updateHandler = async <Args extends UpdateArgs>(
  req: UpdateRequest,
  model: { update: Function },
  options?: UpdateOptions<Omit<Args, "data" | "where">>
) => {
  const { id } = req.params;

  const data = reduceData(req.params.data, options);

  if (options?.debug) {
    console.log("updateHandler:data", data);
  }

  const updated = await model.update({
    data,
    include: options?.include ?? undefined,
    select: options?.select ?? undefined,
    where: { id },
  });

  if (options?.audit) {
    await auditHandler(req, options.audit);
  }

  const response = { data: updated };

  return response;
};
