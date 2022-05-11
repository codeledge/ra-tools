var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createHandler: () => createHandler,
  dataProvider: () => dataProvider,
  defaultHandler: () => defaultHandler,
  deleteHandler: () => deleteHandler,
  deleteManyHandler: () => deleteManyHandler,
  extractOrderBy: () => extractOrderBy,
  extractSkipTake: () => extractSkipTake,
  extractWhere: () => extractWhere,
  getListHandler: () => getListHandler,
  getManyHandler: () => getManyHandler,
  getManyReferenceHandler: () => getManyReferenceHandler,
  getOneHandler: () => getOneHandler,
  updateHandler: () => updateHandler
});
module.exports = __toCommonJS(src_exports);

// src/createHandler.ts
var createHandler = async (req, res, table, options) => {
  const { data } = req.body.params;
  Object.entries(data).forEach(([prop, value]) => {
    var _a;
    const foreignConnectKey = (_a = options == null ? void 0 : options.connect) == null ? void 0 : _a[prop];
    if (foreignConnectKey) {
      data[prop] = {
        connect: value.map((key) => ({ [foreignConnectKey]: key }))
      };
    }
  });
  const created = await table.create({
    data
  });
  return res.json({ data: created });
};

// src/dataProvider.ts
var import_axios = __toESM(require("axios"));
var dataProvider = (endpoint, options) => {
  const apiService = import_axios.default.create({
    baseURL: endpoint
  });
  apiService.interceptors.response.use((res) => res.data);
  return {
    getList: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "getList",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    getOne: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "getOne",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    getMany: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "getMany",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    getManyReference: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "getManyReference",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    create: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "create",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    update: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "update",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    updateMany: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "updateMany",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    delete: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "delete",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    },
    deleteMany: (resource, params) => {
      var _a, _b;
      return apiService.post(resource, {
        method: "deleteMany",
        resource,
        params,
        model: (_b = (_a = options == null ? void 0 : options.resourceToModelMap) == null ? void 0 : _a[resource]) != null ? _b : void 0
      });
    }
  };
};

// src/extractSkipTake.ts
var extractSkipTake = (req) => {
  const { pagination } = req.body.params;
  let skip;
  let take;
  if (pagination) {
    const { page, perPage } = pagination;
    const first = (page - 1) * perPage;
    const last = page * perPage - 1;
    if (first === 0 && last === 999) {
    } else {
      skip = first;
      take = last - first + 1;
    }
  }
  return { skip, take };
};

// src/extractOrderBy.ts
var import_set_value = __toESM(require("set-value"));
var extractOrderBy = (req) => {
  const { sort } = req.body.params;
  let orderBy = {};
  if (sort) {
    const { field, order } = sort;
    if (field && order) {
      (0, import_set_value.default)(orderBy, field, order.toLowerCase());
    }
  }
  return orderBy;
};

// src/extractWhere.ts
var import_set_value2 = __toESM(require("set-value"));
var logicalOperators = ["gte", "lte", "lt", "gt"];
var extractWhere = (req) => {
  const { filter } = req.body.params;
  const where = {};
  if (filter) {
    Object.entries(filter).forEach(([colName, value]) => {
      if (colName.startsWith("_"))
        return;
      if (value === "")
        return;
      const hasOperator = logicalOperators.some((operator) => {
        if (colName.endsWith(`_${operator}`)) {
          [colName] = colName.split(`_${operator}`);
          (0, import_set_value2.default)(where, colName, { [operator]: value }, { merge: true });
          return true;
        }
      });
      if (hasOperator)
        return;
      if (colName === "q") {
      } else if (colName === "id" || colName === "uuid" || colName === "cuid" || colName.endsWith("_id") || typeof value === "number" || typeof value === "boolean") {
        (0, import_set_value2.default)(where, colName, value);
      } else if (Array.isArray(value)) {
        (0, import_set_value2.default)(where, colName, { in: value });
      } else if (typeof value === "string") {
        (0, import_set_value2.default)(where, colName, { contains: value });
      }
    });
  }
  return where;
};

// src/getListHandler.ts
var getListHandler = async (req, res, table, options) => {
  var _a, _b, _c, _d, _e, _f;
  const { pagination, sort, filter } = req.body.params;
  let queryArgs = {
    findManyArg: {
      select: (_a = options == null ? void 0 : options.select) != null ? _a : void 0,
      include: (_b = options == null ? void 0 : options.include) != null ? _b : void 0,
      where: (_c = options == null ? void 0 : options.where) != null ? _c : {}
    },
    countArg: {
      where: (_d = options == null ? void 0 : options.where) != null ? _d : {}
    }
  };
  if (!table)
    throw new Error(`missing table in getListHandler`);
  const where = extractWhere(req);
  queryArgs.findManyArg.where = __spreadValues(__spreadValues({}, queryArgs.findManyArg.where), where);
  queryArgs.countArg.where = __spreadValues(__spreadValues({}, queryArgs.countArg.where), where);
  const { skip, take } = extractSkipTake(req);
  queryArgs.findManyArg.skip = skip;
  queryArgs.findManyArg.take = take;
  if (sort) {
    queryArgs.findManyArg.orderBy = extractOrderBy(req);
    const { field } = sort;
    if (field && ((_e = options == null ? void 0 : options.noNullsOnSort) == null ? void 0 : _e.includes(field))) {
      queryArgs.findManyArg.where = { [field]: { not: null } };
      queryArgs.countArg.where = { [field]: { not: null } };
    }
  }
  if (options == null ? void 0 : options.debug) {
    console.log("queryArgs", JSON.stringify(queryArgs, null, 2));
  }
  const [data, total] = await Promise.all([
    table.findMany(queryArgs.findManyArg),
    table.count(queryArgs.countArg)
  ]);
  await ((_f = options == null ? void 0 : options.transform) == null ? void 0 : _f.call(options, data));
  res.json({
    data,
    total
  });
};

// src/getManyHandler.ts
var getManyHandler = async (req, res, table) => {
  const { ids } = req.body.params;
  const list = await table.findMany({
    where: { id: { in: ids } }
  });
  res.json({ data: list });
};

// src/getOneHandler.ts
var getOneHandler = async (req, res, table, arg) => {
  var _a, _b;
  const row = await table.findUnique({
    where: { id: +req.body.params.id },
    select: (_a = arg == null ? void 0 : arg.select) != null ? _a : void 0,
    include: (_b = arg == null ? void 0 : arg.include) != null ? _b : void 0
  });
  return res.json({ data: row });
};

// src/lib/isObject.ts
var isObject = (arg) => Object.prototype.toString.call(arg) === "[object Object]";

// src/updateHandler.ts
var updateHandler = async (req, res, table, options) => {
  const data = Object.entries(req.body.params.data).reduce((fields, [key, value]) => {
    var _a;
    if (!isObject(value) && !((_a = options == null ? void 0 : options.skipFields) == null ? void 0 : _a.includes(key)))
      fields[key] = value;
    return fields;
  }, {});
  const updated = await table.update({
    where: { id: +req.body.params.id },
    data
  });
  return res.json({ data: updated });
};

// src/deleteHandler.ts
var deleteHandler = async (req, res, table, options) => {
  const deleted = (options == null ? void 0 : options.softDeleteField) ? await table.update({
    where: { id: +req.body.params.id },
    data: {
      [options == null ? void 0 : options.softDeleteField]: new Date()
    }
  }) : await table.delete({
    where: { id: +req.body.params.id }
  });
  return res.json({ data: deleted });
};

// src/deleteManyHandler.ts
var deleteManyHandler = async (req, res, table, options) => {
  const deleted = (options == null ? void 0 : options.softDeleteField) ? await table.updateMany({
    where: { id: { in: req.body.params.ids } },
    data: {
      [options == null ? void 0 : options.softDeleteField]: new Date()
    }
  }) : await table.deleteMany({
    where: { id: { in: req.body.params.ids } }
  });
  return res.json({ data: req.body.params.ids });
};

// src/getManyReferenceHandler.ts
var getManyReferenceHandler = async (req, res, table) => {
  const { id, target } = req.body.params;
  const orderBy = extractOrderBy(req);
  const where = extractWhere(req);
  const { skip, take } = extractSkipTake(req);
  const list = await table.findMany({
    where: __spreadValues({ [target]: id }, where),
    orderBy,
    skip,
    take
  });
  res.json({ data: list, total: list.length });
};

// src/defaultHandler.ts
var defaultHandler = async (req, res, prisma, options) => {
  const tableName = req.body.model || req.body.resource;
  if (!tableName)
    throw new Error(`table name is empty`);
  const prismaDelegate = prisma[tableName];
  if (!prismaDelegate)
    throw new Error(`No table/collection found for ${req.body.model || req.body.resource}`);
  switch (req.body.method) {
    case "getList": {
      return await getListHandler(req, res, prismaDelegate);
    }
    case "getOne": {
      return await getOneHandler(req, res, prismaDelegate);
    }
    case "getMany": {
      return await getManyHandler(req, res, prismaDelegate);
    }
    case "getManyReference": {
      throw await getManyReferenceHandler(req, res, prismaDelegate);
    }
    case "create": {
      return await createHandler(req, res, prismaDelegate);
    }
    case "update": {
      return await updateHandler(req, res, prismaDelegate, options.update);
    }
    case "delete": {
      return await deleteHandler(req, res, prismaDelegate, options == null ? void 0 : options.delete);
    }
    case "deleteMany": {
      return await deleteManyHandler(req, res, prismaDelegate, options == null ? void 0 : options.delete);
    }
    default:
      throw new Error("Invalid method");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createHandler,
  dataProvider,
  defaultHandler,
  deleteHandler,
  deleteManyHandler,
  extractOrderBy,
  extractSkipTake,
  extractWhere,
  getListHandler,
  getManyHandler,
  getManyReferenceHandler,
  getOneHandler,
  updateHandler
});
