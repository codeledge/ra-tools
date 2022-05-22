import { isObject } from "./isObject";

export const isNotField = (fieldName: string, value?: any) => {
  // ignore underscored fields (_count, _sum, _avg, _min, _max and _helpers)
  // especially in updates they would throw an error
  if (fieldName.startsWith("_")) return true;

  if (value && isObject(value)) return true;

  return false;
};
