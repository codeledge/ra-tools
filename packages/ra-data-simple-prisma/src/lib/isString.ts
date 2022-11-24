export const isString = (arg): arg is string =>
  Object.prototype.toString.call(arg) === "[object String]";
