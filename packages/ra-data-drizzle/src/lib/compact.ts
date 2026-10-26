/** Removes `undefined` and `null` values, drizzle query configs dislike them */
export const compact = <T extends Record<string, any>>(object: T) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value != null),
  ) as Partial<T>;
