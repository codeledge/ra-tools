import { describe, expect, jest, test } from "@jest/globals";
import type { PrismaClientOrDynamicClientExtension } from "../src/PrismaClientTypes";
import type { CreateRequest, GetListRequest } from "../src/Http";

jest.mock("../src/createHandler");
jest.mock("../src/getListHandler");

import { bindCreateHandler, bindGetListHandler } from "../src/bindHandler";
import { createHandler } from "../src/createHandler";
import { getListHandler } from "../src/getListHandler";

const mockCreateHandler = createHandler as jest.MockedFunction<
  typeof createHandler
>;
const mockGetListHandler = getListHandler as jest.MockedFunction<
  typeof getListHandler
>;

const writeClient = {
  name: "write",
} as unknown as PrismaClientOrDynamicClientExtension;
const readClient = {
  name: "read",
} as unknown as PrismaClientOrDynamicClientExtension;
const debugClient = {
  name: "debug",
} as unknown as PrismaClientOrDynamicClientExtension;

const resourceToModelMap = { userResource: "core_person" };
const auditModel = { create: jest.fn() };
const authProvider = { getIdentity: jest.fn() } as never;

const createReq: CreateRequest = {
  method: "create",
  resource: "post",
  params: { data: { title: "Hi" } },
};

const getListReq: GetListRequest = {
  method: "getList",
  resource: "post",
  params: {
    filter: {},
    pagination: { page: 1, perPage: 10 },
    sort: { field: "id", order: "ASC" },
  },
};

describe("bindCreateHandler", () => {
  const create = bindCreateHandler({
    prismaClient: writeClient,
    resourceToModelMap,
    audit: { model: auditModel },
  });

  test("passes the bound prismaClient, map, and audit model", async () => {
    await create(createReq);
    expect(mockCreateHandler).toHaveBeenCalledWith(createReq, writeClient, {
      resourceToModelMap,
      audit: { model: auditModel },
    });
  });

  test("merges the bound audit model with a per-request authProvider", async () => {
    await create(createReq, { audit: { authProvider } });
    expect(mockCreateHandler).toHaveBeenCalledWith(createReq, writeClient, {
      resourceToModelMap,
      audit: { model: auditModel, authProvider },
    });
  });

  test("lets call-site audit fields win over defaults", async () => {
    const otherModel = { create: jest.fn() };
    await create(createReq, {
      audit: { model: otherModel, authProvider },
    });
    expect(mockCreateHandler).toHaveBeenCalledWith(createReq, writeClient, {
      resourceToModelMap,
      audit: { model: otherModel, authProvider },
    });
  });

  test("overrides the bound prismaClient when another client is passed", async () => {
    await create(createReq, { prismaClient: debugClient });
    expect(mockCreateHandler).toHaveBeenCalledWith(createReq, debugClient, {
      resourceToModelMap,
      audit: { model: auditModel },
    });
  });

  test("does not forward prismaClient inside the handler options", async () => {
    await create(createReq, {
      prismaClient: debugClient,
      debug: true,
    });
    expect(mockCreateHandler).toHaveBeenCalledWith(createReq, debugClient, {
      resourceToModelMap,
      audit: { model: auditModel },
      debug: true,
    });
  });
});

describe("bindGetListHandler", () => {
  const getList = bindGetListHandler({
    prismaClient: readClient,
    resourceToModelMap,
  });

  test("passes the bound read client and map", async () => {
    await getList(getListReq);
    expect(mockGetListHandler).toHaveBeenCalledWith(getListReq, readClient, {
      resourceToModelMap,
    });
  });

  test("passes handler-specific options alongside the bound defaults", async () => {
    await getList(getListReq, { include: { tags: true }, debug: true });
    expect(mockGetListHandler).toHaveBeenCalledWith(getListReq, readClient, {
      resourceToModelMap,
      include: { tags: true },
      debug: true,
    });
  });

  test("overrides the bound resourceToModelMap when another map is passed", async () => {
    const overrideMap = { userResource: "admin_user" };
    await getList(getListReq, { resourceToModelMap: overrideMap });
    expect(mockGetListHandler).toHaveBeenCalledWith(getListReq, readClient, {
      resourceToModelMap: overrideMap,
    });
  });
});
