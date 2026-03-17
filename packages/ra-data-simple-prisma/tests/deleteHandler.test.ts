import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { deleteHandler } from "../src/deleteHandler";
import type { DeleteRequest } from "../src/Http";

jest.mock("../src/getModel");
jest.mock("../src/audit/auditHandler");

import { auditHandler } from "../src/audit/auditHandler";
import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockAuditHandler = auditHandler as jest.MockedFunction<typeof auditHandler>;

function makeReq(id: string | number, resource = "post"): DeleteRequest {
  return {
    method: "delete",
    resource,
    params: { id, previousData: {} },
  };
}

function makeMockModel() {
  return {
    delete: jest.fn().mockResolvedValue({ id: 1, title: "Deleted" } as never),
    update: jest.fn().mockResolvedValue({ id: 1, title: "Deleted" } as never),
  };
}

describe("deleteHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("calls model.delete with where { id } and returns { data }", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await deleteHandler(makeReq(42), {} as never);

    expect(model.delete).toHaveBeenCalledWith({
      where: { id: 42 },
    });
    expect(model.update).not.toHaveBeenCalled();
    expect(result).toEqual({ data: { id: 1, title: "Deleted" } });
  });

  test("uses soft delete field with model.update and current date", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await deleteHandler(makeReq(9), {} as never, {
      softDeleteField: "deletedAt",
    });

    expect(model.delete).not.toHaveBeenCalled();
    expect(model.update).toHaveBeenCalledTimes(1);
    expect(model.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: {
        deletedAt: expect.any(Date),
      },
    });
    expect(result).toEqual({ data: { id: 1, title: "Deleted" } });
  });

  test("calls auditHandler when audit options are provided", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockAuditHandler.mockResolvedValue(undefined as never);

    const req = makeReq(3);
    const auditOptions = {
      model: { create: jest.fn() },
      authProvider: {} as never,
    };

    await deleteHandler(req, {} as never, { audit: auditOptions });

    expect(mockAuditHandler).toHaveBeenCalledWith(req, auditOptions);
  });

  test("does not call auditHandler when audit options are absent", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await deleteHandler(makeReq(3), {} as never);

    expect(mockAuditHandler).not.toHaveBeenCalled();
  });

  test("uses custom primaryKey in where clause and maps response to id", async () => {
    const model = {
      delete: jest.fn().mockResolvedValue({ StatusId: 55, name: "Archived" } as never),
      update: jest.fn(),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await deleteHandler(makeReq("archived"), {} as never, {
      primaryKey: "StatusId",
    });

    expect(model.delete).toHaveBeenCalledWith({
      where: { StatusId: "archived" },
    });
    expect(result).toEqual({
      data: { id: 55, name: "Archived" },
    });
    expect(result.data).not.toHaveProperty("StatusId");
  });
});
