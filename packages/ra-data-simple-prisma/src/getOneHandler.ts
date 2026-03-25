import { getModel } from "./getModel";
import { GetOneRequest } from "./Http";
import { mapPrimaryKeyToId } from "./mapPrimaryKeyToId";
import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";

export type GetOneArgs = {
  include?: object | null;
  select?: object | null;
  omit?: object | null;
  // there is no where because it's always id based
};

export type GetOneOptions<Args extends GetOneArgs = GetOneArgs> = Args & {
  debug?: boolean;
  primaryKey?: string;
  transform?: (row: any) => any | Promise<any>;
};

export const getOneHandler = async <Args extends GetOneArgs>(
  req: GetOneRequest,
  prismaClient: PrismaClientOrDynamicClientExtension,
  options?: GetOneOptions<Omit<Args, "where">>, // omit where so the Prisma.ModelFindUniqueArgs can be passed in, without complaining about the where property missing
) => {
  const { id } = req.params;
  const primaryKey = options?.primaryKey ?? "id";
  const model = getModel(req, prismaClient);
  const where = { [primaryKey]: id };

  if (options?.debug) console.log("getOneHandler:where", where);

  const row = await model.findUnique({
    where,
    select: options?.select ?? undefined,
    omit: options?.omit ?? undefined,
    include: options?.include ?? undefined,
  });

  // TRANSFORM STAGE
  if (options?.debug) console.log("getOneHandler:beforeTransform", row);

  const transformedRow = options?.transform ? await options.transform(row) : row;

  if (options?.debug) console.log("getOneHandler:afterTransform", transformedRow);

  // RESPONSE STAGE
  const response = { data: mapPrimaryKeyToId(transformedRow, primaryKey) };

  return response;
};
