import { AuditOptions } from "./audit/types";
import { CreateRequest, Response } from "./Http";
import { auditHandler } from "./audit/auditHandler";

export type CreateArgs = {
  include?: object | null;
  select?: object | null;
};

export type CreateOptions<Args extends CreateArgs = CreateArgs> = {
  select?: Args["select"];
  include?: Args["include"];
  connect?: {
    [key: string]: string;
  };
  audit?: AuditOptions;
};

export const createHandler = async <Args extends CreateArgs>(
  req: CreateRequest,
  res: Response,
  model: { create: Function },
  options?: CreateOptions<Args>
) => {
  const { data } = req.body.params;

  // Filter out any fields that are not in the schema
  Object.entries(data).forEach(([prop, value]) => {
    if (value === "") {
      delete data[prop];
    }
  });

  // transfor an array to a connect (many-to-many)
  // e.g. (handler)
  // createHandler(req, res, prismaClient.post, {
  //      connect: {
  //        tags: "id",
  //      },
  //    });
  // (data) tags: [1, 2, 3] => tags: { connect: {id: [1, 2, 3]} }
  Object.entries(data).forEach(([prop, value]) => {
    const foreignConnectKey = options?.connect?.[prop];
    if (foreignConnectKey) {
      data[prop] = {
        connect: Array.isArray(value)
          ? value.map((key) => ({ [foreignConnectKey]: key }))
          : { [foreignConnectKey]: value },
      };
    }
  });

  const created = await model.create({
    data,
    select: options?.select ?? undefined,
    include: options?.include ?? undefined,
  });

  if (options?.audit) {
    await auditHandler(req, options?.audit, created);
  }

  res.json({ data: created });
};
