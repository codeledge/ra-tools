import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";
import { RaPayload } from "./Http";

export const getModel = (
  req: RaPayload,
  prismaClient: PrismaClientOrDynamicClientExtension
) => {
  const modelName = req.model || req.resource;
  if (!modelName) throw new Error(`model name is empty`);

  const model = prismaClient[modelName];
  if (!model) throw new Error(`No model found for "${modelName}"`);

  return model;
};
