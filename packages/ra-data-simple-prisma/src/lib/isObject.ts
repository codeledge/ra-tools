export const isObject = (arg): arg is object =>
  Object.prototype.toString.call(arg) === "[object Object]";
