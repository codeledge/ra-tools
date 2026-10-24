const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Validate and double-quote a SQL identifier (table/column). */
export const quoteIdent = (name: string): string => {
  if (!IDENT_RE.test(name)) {
    throw new Error(`Invalid SQL identifier: "${name}"`);
  }
  return `"${name}"`;
};
