export const isObject = (arg) =>
  Object.prototype.toString.call(arg) === "[object Object]";
