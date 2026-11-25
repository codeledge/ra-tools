import { setObjectPath } from "deverything";
import { RDSPError } from "../RDSPError";

// Segments that would let a request reach Object.prototype via a path walk.
const FORBIDDEN_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

// Prisma model and field names are identifiers. Anything else coming from the
// request (sort fields, filter keys, reference targets) is rejected.
const SEGMENT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const isSafePathSegment = (segment: unknown): segment is string =>
  typeof segment === "string" &&
  SEGMENT_PATTERN.test(segment) &&
  !FORBIDDEN_SEGMENTS.has(segment);

export const assertSafePathSegment = (segment: unknown, context: string) => {
  if (!isSafePathSegment(segment)) {
    throw new RDSPError(`${context}: invalid field name "${String(segment)}"`);
  }
};

export const splitSafePath = (path: unknown, context: string): string[] => {
  if (typeof path !== "string" || path === "") {
    throw new RDSPError(`${context}: invalid field path "${String(path)}"`);
  }
  const segments = path.split(".");
  segments.forEach((segment) => assertSafePathSegment(segment, context));
  return segments;
};

/**
 * Sets `value` at a dot-separated `path` on `target`. Every segment is
 * validated first, so request-supplied paths can't write to Object.prototype
 * through `deverything.setObjectPath`.
 */
export const setSafePath = (
  target: Record<string, unknown>,
  path: string,
  value: unknown,
  context: string,
) => {
  splitSafePath(path, context);
  setObjectPath(target, path, value);
};
