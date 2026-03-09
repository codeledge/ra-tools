import { describe, expect, jest, test } from "@jest/globals";
import type { AuthProvider } from "react-admin";
import { defaultHandler } from "../src/defaultHandler";
import type { RaPayload } from "../src/Http";
import type { PrismaClientOrDynamicClientExtension } from "../src/PrismaClientTypes";

jest.mock("../src/createHandler");
jest.mock("../src/deleteHandler");
jest.mock("../src/deleteManyHandler");
jest.mock("../src/getListHandler");
jest.mock("../src/getManyHandler");
jest.mock("../src/getManyReferenceHandler");
jest.mock("../src/getOneHandler");
jest.mock("../src/updateHandler");
jest.mock("../src/updateManyHandler");

import { createHandler } from "../src/createHandler";
import { deleteHandler } from "../src/deleteHandler";
import { deleteManyHandler } from "../src/deleteManyHandler";
import { getListHandler } from "../src/getListHandler";
import { getManyHandler } from "../src/getManyHandler";
import { getManyReferenceHandler } from "../src/getManyReferenceHandler";
import { getOneHandler } from "../src/getOneHandler";
import { updateHandler } from "../src/updateHandler";
import { updateManyHandler } from "../src/updateManyHandler";

const mockCreateHandler = createHandler as jest.MockedFunction<typeof createHandler>;
const mockDeleteHandler = deleteHandler as jest.MockedFunction<typeof deleteHandler>;
const mockDeleteManyHandler = deleteManyHandler as jest.MockedFunction<typeof deleteManyHandler>;
const mockGetListHandler = getListHandler as jest.MockedFunction<typeof getListHandler>;
const mockGetManyHandler = getManyHandler as jest.MockedFunction<typeof getManyHandler>;
const mockGetManyReferenceHandler = getManyReferenceHandler as jest.MockedFunction<typeof getManyReferenceHandler>;
const mockGetOneHandler = getOneHandler as jest.MockedFunction<typeof getOneHandler>;
const mockUpdateHandler = updateHandler as jest.MockedFunction<typeof updateHandler>;
const mockUpdateManyHandler = updateManyHandler as jest.MockedFunction<typeof updateManyHandler>;

const prismaClient = {} as unknown as PrismaClientOrDynamicClientExtension;

const mockAuthProvider = {
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(),
  checkError: jest.fn(),
} as unknown as AuthProvider;

const mockResult = { data: { id: 1 } };

beforeEach(() => {
  mockCreateHandler.mockResolvedValue(mockResult as never);
  mockDeleteHandler.mockResolvedValue(mockResult as never);
  mockDeleteManyHandler.mockResolvedValue({ data: [1] } as never);
  mockGetListHandler.mockResolvedValue({ data: [], total: 0 } as never);
  mockGetManyHandler.mockResolvedValue({ data: [] } as never);
  mockGetManyReferenceHandler.mockResolvedValue({ data: [], total: 0 } as never);
  mockGetOneHandler.mockResolvedValue(mockResult as never);
  mockUpdateHandler.mockResolvedValue(mockResult as never);
  mockUpdateManyHandler.mockResolvedValue({ data: [1] } as never);
});

describe("defaultHandler", () => {
  describe("create", () => {
    const req: RaPayload = {
      method: "create",
      resource: "post",
      params: { data: { title: "New Post" } },
    };

    test("calls createHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockCreateHandler).toHaveBeenCalledWith(req, prismaClient, {});
    });

    test("passes create options to createHandler", async () => {
      const options = { create: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockCreateHandler).toHaveBeenCalledWith(req, prismaClient, {
        debug: true,
        audit: undefined,
      });
    });

    test("passes audit options to createHandler", async () => {
      const auditModel = { create: jest.fn() };
      const options = { audit: { model: auditModel, authProvider: mockAuthProvider } };
      await defaultHandler(req, prismaClient, options);
      expect(mockCreateHandler).toHaveBeenCalledWith(req, prismaClient, {
        audit: expect.objectContaining({ model: auditModel }),
      });
    });

    test("returns the result from createHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toBe(mockResult);
    });
  });

  describe("delete", () => {
    const req: RaPayload = {
      method: "delete",
      resource: "post",
      params: { id: 1, previousData: { id: 1 } },
    };

    test("calls deleteHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockDeleteHandler).toHaveBeenCalledWith(req, prismaClient, {});
    });

    test("passes delete options to deleteHandler", async () => {
      const options = { delete: { softDeleteField: "deletedAt" } };
      await defaultHandler(req, prismaClient, options);
      expect(mockDeleteHandler).toHaveBeenCalledWith(req, prismaClient, {
        softDeleteField: "deletedAt",
        audit: undefined,
      });
    });

    test("passes audit options to deleteHandler", async () => {
      const auditModel = { create: jest.fn() };
      const options = { audit: { model: auditModel, authProvider: mockAuthProvider } };
      await defaultHandler(req, prismaClient, options);
      expect(mockDeleteHandler).toHaveBeenCalledWith(req, prismaClient, {
        audit: expect.objectContaining({ model: auditModel }),
      });
    });

    test("returns the result from deleteHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toBe(mockResult);
    });
  });

  describe("deleteMany", () => {
    const req: RaPayload = {
      method: "deleteMany",
      resource: "post",
      params: { ids: [1, 2] },
    };

    test("calls deleteManyHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockDeleteManyHandler).toHaveBeenCalledWith(req, prismaClient, {});
    });

    test("passes delete options to deleteManyHandler", async () => {
      const options = { delete: { softDeleteField: "deletedAt" } };
      await defaultHandler(req, prismaClient, options);
      expect(mockDeleteManyHandler).toHaveBeenCalledWith(req, prismaClient, {
        softDeleteField: "deletedAt",
        audit: undefined,
      });
    });

    test("passes audit options to deleteManyHandler", async () => {
      const auditModel = { create: jest.fn() };
      const options = { audit: { model: auditModel, authProvider: mockAuthProvider } };
      await defaultHandler(req, prismaClient, options);
      expect(mockDeleteManyHandler).toHaveBeenCalledWith(req, prismaClient, {
        audit: expect.objectContaining({ model: auditModel }),
      });
    });

    test("returns the result from deleteManyHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toEqual({ data: [1] });
    });
  });

  describe("getList", () => {
    const req: RaPayload = {
      method: "getList",
      resource: "post",
      params: {
        filter: {},
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    test("calls getListHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockGetListHandler).toHaveBeenCalledWith(req, prismaClient, undefined);
    });

    test("passes getList options to getListHandler", async () => {
      const options = { getList: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockGetListHandler).toHaveBeenCalledWith(req, prismaClient, { debug: true });
    });

    test("returns the result from getListHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe("getMany", () => {
    const req: RaPayload = {
      method: "getMany",
      resource: "post",
      params: { ids: [1, 2] },
    };

    test("calls getManyHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockGetManyHandler).toHaveBeenCalledWith(req, prismaClient, undefined);
    });

    test("passes getMany options to getManyHandler", async () => {
      const options = { getMany: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockGetManyHandler).toHaveBeenCalledWith(req, prismaClient, { debug: true });
    });

    test("returns the result from getManyHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toEqual({ data: [] });
    });
  });

  describe("getManyReference", () => {
    const req: RaPayload = {
      method: "getManyReference",
      resource: "post",
      params: {
        target: "authorId",
        id: 1,
        filter: {},
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    test("calls getManyReferenceHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockGetManyReferenceHandler).toHaveBeenCalledWith(req, prismaClient, undefined);
    });

    test("passes getManyReference options to getManyReferenceHandler", async () => {
      const options = { getManyReference: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockGetManyReferenceHandler).toHaveBeenCalledWith(req, prismaClient, { debug: true });
    });

    test("returns the result from getManyReferenceHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe("getOne", () => {
    const req: RaPayload = {
      method: "getOne",
      resource: "post",
      params: { id: 1 },
    };

    test("calls getOneHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockGetOneHandler).toHaveBeenCalledWith(req, prismaClient, undefined);
    });

    test("passes getOne options to getOneHandler", async () => {
      const options = { getOne: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockGetOneHandler).toHaveBeenCalledWith(req, prismaClient, { debug: true });
    });

    test("returns the result from getOneHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toBe(mockResult);
    });
  });

  describe("update", () => {
    const req: RaPayload = {
      method: "update",
      resource: "post",
      params: { id: 1, data: { title: "Updated" }, previousData: { id: 1, title: "Old" } },
    };

    test("calls updateHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockUpdateHandler).toHaveBeenCalledWith(req, prismaClient, {});
    });

    test("passes update options to updateHandler", async () => {
      const options = { update: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockUpdateHandler).toHaveBeenCalledWith(req, prismaClient, {
        debug: true,
        audit: undefined,
      });
    });

    test("passes audit options to updateHandler", async () => {
      const auditModel = { create: jest.fn() };
      const options = { audit: { model: auditModel, authProvider: mockAuthProvider } };
      await defaultHandler(req, prismaClient, options);
      expect(mockUpdateHandler).toHaveBeenCalledWith(req, prismaClient, {
        audit: expect.objectContaining({ model: auditModel }),
      });
    });

    test("returns the result from updateHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toBe(mockResult);
    });
  });

  describe("updateMany", () => {
    const req: RaPayload = {
      method: "updateMany",
      resource: "post",
      params: { ids: [1, 2], data: { published: true } },
    };

    test("calls updateManyHandler with the request and prismaClient", async () => {
      await defaultHandler(req, prismaClient);
      expect(mockUpdateManyHandler).toHaveBeenCalledWith(req, prismaClient, {});
    });

    test("passes update options to updateManyHandler", async () => {
      const options = { update: { debug: true } };
      await defaultHandler(req, prismaClient, options);
      expect(mockUpdateManyHandler).toHaveBeenCalledWith(req, prismaClient, {
        debug: true,
        audit: undefined,
      });
    });

    test("passes audit options to updateManyHandler", async () => {
      const auditModel = { create: jest.fn() };
      const options = { audit: { model: auditModel, authProvider: mockAuthProvider } };
      await defaultHandler(req, prismaClient, options);
      expect(mockUpdateManyHandler).toHaveBeenCalledWith(req, prismaClient, {
        audit: expect.objectContaining({ model: auditModel }),
      });
    });

    test("returns the result from updateManyHandler", async () => {
      const result = await defaultHandler(req, prismaClient);
      expect(result).toEqual({ data: [1] });
    });
  });

  describe("invalid method", () => {
    test("throws an error for an unknown method", async () => {
      const req = { method: "unknownMethod", resource: "post", params: {} } as unknown as RaPayload;
      await expect(defaultHandler(req, prismaClient)).rejects.toThrow("Invalid method");
    });
  });
});
