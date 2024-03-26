import { AuditOptions } from "./audit/types";
import { CreateRequest } from "./Http";
import { auditHandler } from "./audit/auditHandler";
import { isNotField } from "./lib/isNotField";
import { firstKey, firstValue, isObject, isString } from "deverything";

export type CreateArgs = {
  include?: object | null;
  select?: object | null;
};

// export type CreateImplicitConnectionShortcut = {
//   [key: string]: string;
// };

// export type CreateImplicitConnection = {
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

export type CreateOptions<Args extends CreateArgs = CreateArgs> = Args & {
  connect?: {
    // TODO: Make this work CreateImplicitConnectionShortcut | CreateImplicitConnection | CreateExplicitConnection;
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
  audit?: AuditOptions;
  debug?: boolean;
};

export const createHandler = async <Args extends CreateArgs>(
  req: CreateRequest,
  model: { create: Function },
  options?: CreateOptions<Omit<Args, "data">> // omit data so the Prisma.ModelCreateArgs can be passed in, without complaining about the data property missing
) => {
  const { data } = req.params;

  if (options?.debug) console.log("createHandler:data", data);

  // Filter out invalid fields
  Object.entries(data).forEach(([key, value]) => {
    if (value === "") {
      delete data[key];
    }
    if (isNotField(key)) {
      delete data[key];
    }
  });

  Object.entries(data).forEach(([prop, value]) => {
    const foreignConnect = options?.connect?.[prop];
    if (isString(foreignConnect)) {
      // foreignConnect => id

      // transform an array to a connect (implicit many-to-many)
      // e.g. (handler)
      // createHandler(payload, prismaClient.post, {
      //      connect: {
      //        tags: "id",
      //      },
      //    });
      // (data) tags: [1, 2, 3] => tags: { connect: [{id: 1}, {id: 2}, {id: 3}] }
      data[prop] = {
        connect: Array.isArray(value)
          ? value.map((key) => ({ [foreignConnect]: key }))
          : { [foreignConnect]: value },
      };

      // in theory no need to remove the original data
    }

    if (isObject(foreignConnect)) {
      if (isObject(firstValue(foreignConnect))) {
        //foreignConnect => { postToMediaRels: { media: "id" } }

        // transform an array to a connect (EXPLICIT many-to-many)
        // e.g. (handler)
        // createHandler(payload, prismaClient.post, {
        //      connect: {
        //        mediaIds: {
        //          postToMediaRels: {
        //            media: "id",
        //          }
        //        },
        //      },
        //    });
        // (data) mediaIds: [1, 2, 3] => postToMediaRels: { create: [{connect: {media: {id: 1}}}, {connect: {media: {id: 2}}}, {connect: {media: {id: 3}}}] }

        const foreignCreateKey = Object.keys(foreignConnect)[0]; // => postToMediaRels
        const foreignConnectObject = firstValue(foreignConnect); // => { media: "id" }
        const foreignConnectModel = firstKey(foreignConnectObject); // => media
        const foreignConnectField = firstValue(foreignConnectObject); // => id

        data[foreignCreateKey] = {
          create: value.map((val) => ({
            [foreignConnectModel]: { connect: { [foreignConnectField]: val } },
          })),
        };
      } else {
        //foreignConnect => { tags: "id" }

        // transform an array to a connect (IMPLICIT many-to-many)
        // e.g. (handler)
        // createHandler(payload, prismaClient.post, {
        //      connect: {
        //        tagIds: {
        //          tags: "id",
        //        },
        //      },
        //    });
        // (data) tagIds: [1, 2, 3] => tags: { connect: [{id: 1}, {id: 2}, {id: 3}] }

        const foreignConnectKey = Object.keys(foreignConnect)[0]; // => tags
        const foreignConnectField = foreignConnect[foreignConnectKey] as string; // => id

        data[foreignConnectKey] = {
          connect: (value as any[]).map((val) => ({
            [foreignConnectField]: val,
          })),
        };
      }

      // remove this data now that it has been transformed into another property
      delete data[prop]; //delete mediaIds/tagIds: [1, 2, 3]
    }
  });

  const created = await model.create({
    data,
    include: options?.include ?? undefined,
    select: options?.select ?? undefined,
  });

  if (options?.debug) console.log("createHandler:created", created);

  if (options?.audit) {
    await auditHandler(req, options?.audit, created);
  }

  const response = { data: created };

  return response;
};
