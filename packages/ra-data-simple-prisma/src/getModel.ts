import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";
import { RaPayload } from "./Http";

export type ResourceToModelMap = Record<string, string>;

export const getModel = (
  req: RaPayload,
  prismaClient: PrismaClientOrDynamicClientExtension,
  resourceToModelMap?: ResourceToModelMap,
) => {
  const modelName = resourceToModelMap?.[req.resource] ?? req.resource;
  if (!modelName) throw new Error(`model name is empty`);

  const model = prismaClient[modelName];
  if (!model) throw new Error(`No model found for "${modelName}"`);

  return model;
};
