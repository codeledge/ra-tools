import { RaPayload } from "./Http";
import { quoteIdent } from "./lib/quoteIdent";

export type ResourceToTableMap = Record<string, string>;

export const getTable = (
  req: RaPayload,
  resourceToTableMap?: ResourceToTableMap,
): string => {
  const tableName = resourceToTableMap?.[req.resource] ?? req.resource;
  if (!tableName) throw new Error(`table name is empty`);
  return quoteIdent(tableName);
};
