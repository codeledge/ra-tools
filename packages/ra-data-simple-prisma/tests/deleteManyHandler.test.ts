import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { deleteManyHandler } from "../src/deleteManyHandler";
import type { DeleteManyRequest } from "../src/Http";

jest.mock("../src/getModel");
jest.mock("../src/audit/auditHandler");

import { auditHandler } from "../src/audit/auditHandler";
import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockAuditHandler = auditHandler as jest.MockedFunction<typeof auditHandler>;

function makeReq(ids: Array<string | number>, resource = "post"): DeleteManyRequest {
  return {
    method: "deleteMany",
    resource,
    params: { ids },
  };
}

function makeMockModel() {
  return {
    deleteMany: jest.fn().mockResolvedValue({ count: 2 } as never),
    updateMany: jest.fn().mockResolvedValue({ count: 2 } as never),
  };
}

describe("deleteManyHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("calls model.deleteMany with where { id: { in: ids } } and returns ids", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await deleteManyHandler(makeReq([1, 2]), {} as never);

    expect(model.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
    });
    expect(model.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual({ data: [1, 2] });
  });

  test("uses soft delete field with model.updateMany and current date", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await deleteManyHandler(makeReq([9, 10]), {} as never, {
      softDeleteField: "deletedAt",
    });

    expect(model.deleteMany).not.toHaveBeenCalled();
    expect(model.updateMany).toHaveBeenCalledTimes(1);
    expect(model.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [9, 10] } },
      data: {
        deletedAt: expect.any(Date),
      },
    });
    expect(result).toEqual({ data: [9, 10] });
  });

  test("calls auditHandler when audit options are provided", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockAuditHandler.mockResolvedValue(undefined as never);

    const req = makeReq([3, 4]);
    const auditOptions = {
      model: { create: jest.fn() },
      authProvider: {} as never,
    };

    await deleteManyHandler(req, {} as never, { audit: auditOptions });

    expect(mockAuditHandler).toHaveBeenCalledWith(req, auditOptions);
  });

  test("does not call auditHandler when audit options are absent", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await deleteManyHandler(makeReq([3, 4]), {} as never);

    expect(mockAuditHandler).not.toHaveBeenCalled();
  });

  test("uses custom primaryKey in where clause and still returns the requested ids", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await deleteManyHandler(makeReq(["archived", "draft"]), {} as never, {
      primaryKey: "StatusId",
    });

    expect(model.deleteMany).toHaveBeenCalledWith({
      where: { StatusId: { in: ["archived", "draft"] } },
    });
    expect(result).toEqual({ data: ["archived", "draft"] });
  });
});
