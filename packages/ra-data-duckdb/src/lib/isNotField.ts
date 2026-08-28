export const isNotField = (fieldName: string) => {
  // ignore underscored fields (_count, _sum, _avg, _min, _max and _helpers)
  // especially in updates they would throw an error
  if (fieldName.startsWith("_")) return true;

  return false;
};
