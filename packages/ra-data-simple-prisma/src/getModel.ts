import { PrismaClientOrDynamicClientExtension } from "./PrismaClientTypes";
import { RaPayload } from "./Http";
import { RDSPError } from "./RDSPError";

export type ResourceToModelMap = Record<string, string>;

const MODEL_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

/**
 * Resolves the Prisma model for a request.
 *
 * `req.resource` comes from the request body, so on its own it lets a client
 * pick any model. Pass `routeResource` (the resource your route serves, e.g.
 * from the URL or hard-coded in a per-resource route) to make the server
 * authoritative: a request naming a different resource is rejected.
 */
export const getModel = (
  req: RaPayload,
  prismaClient: PrismaClientOrDynamicClientExtension,
  resourceToModelMap?: ResourceToModelMap,
  routeResource?: string,
) => {
  if (routeResource !== undefined && req.resource !== routeResource) {
    throw new RDSPError(
      `Request resource "${String(req.resource)}" does not match route resource "${routeResource}"`,
    );
  }

  const resource = routeResource ?? req.resource;
  const mappedModelName =
    resourceToModelMap &&
    Object.prototype.hasOwnProperty.call(resourceToModelMap, resource)
      ? resourceToModelMap[resource]
      : undefined;
  const modelName = mappedModelName ?? resource;
  if (!modelName) throw new Error(`model name is empty`);

  // Blocks $-prefixed client methods ($queryRaw, $transaction...), names that
  // aren't identifiers, and inherited properties like "constructor".
  if (
    typeof modelName !== "string" ||
    !MODEL_NAME_PATTERN.test(modelName) ||
    modelName in Object.prototype
  ) {
    throw new RDSPError(`No model found for "${String(modelName)}"`, 404);
  }

  const model = prismaClient[modelName];
  if (!model) throw new RDSPError(`No model found for "${modelName}"`, 404);

  return model;
};
