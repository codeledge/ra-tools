import { describe, expect, jest, test } from "@jest/globals";
import type { UpdateManyRequest } from "../src/Http";
import { updateManyHandler } from "../src/updateManyHandler";

jest.mock("../src/getModel");
jest.mock("../src/audit/auditHandler");

import { auditHandler } from "../src/audit/auditHandler";
import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockAuditHandler = auditHandler as jest.MockedFunction<typeof auditHandler>;

function makeReq(ids: Array<string | number>, data: Record<string, unknown>, resource = "post"): UpdateManyRequest {
  return {
    method: "updateMany",
    resource,
    params: { ids, data },
  };
}

function makeMockModel() {
  return {
    updateMany: jest.fn().mockResolvedValue({ count: 2 } as never),
  };
}

describe("updateManyHandler", () => {
  test("calls model.updateMany with reduced data and id where clause", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await updateManyHandler(makeReq([1, 2], { published: true }), {} as never);

    expect(model.updateMany).toHaveBeenCalledWith({
      data: { published: true },
      where: { id: { in: [1, 2] } },
    });
    expect(result).toEqual({ data: [1, 2] });
  });

  test("uses custom primaryKey in where clause", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await updateManyHandler(makeReq([10, 20], { published: true }), {} as never, {
      primaryKey: "StatusId",
    });

    expect(model.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { StatusId: { in: [10, 20] } } }));
  });

  test("applies reduceData transformations (skipFields)", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await updateManyHandler(makeReq([1], { title: "Keep", secret: "Drop" }), {} as never, {
      skipFields: { secret: true },
    });

    expect(model.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { title: "Keep" } }));
  });

  test("applies reduceData transformations (set string shortcut)", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await updateManyHandler(makeReq([1, 2], { tags: [1, 2] }), {} as never, {
      set: { tags: "id" },
    });

    expect(model.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { tags: { set: [{ id: 1 }, { id: 2 }] } },
      }),
    );
  });

  test("debug option logs reduced data", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await updateManyHandler(makeReq([1], { title: "Debug" }), {} as never, { debug: true });

    expect(consoleSpy).toHaveBeenCalledWith("updateManyHandler:data", { title: "Debug" });
  });

  test("audit option calls auditHandler", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockAuditHandler.mockResolvedValue(undefined as never);

    const req = makeReq([1, 2], { published: true });
    const auditOptions = {
      model: { create: jest.fn() },
      authProvider: {} as never,
    };

    await updateManyHandler(req, {} as never, { audit: auditOptions });

    expect(mockAuditHandler).toHaveBeenCalledWith(req, auditOptions);
  });

  test("does not call auditHandler when audit option is absent", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await updateManyHandler(makeReq([1], { title: "No audit" }), {} as never);

    expect(mockAuditHandler).not.toHaveBeenCalled();
  });

  test("rejects payload data containing configured custom primary key field", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq([1], { title: "Updated", StatusId: 1 });

    await expect(
      updateManyHandler(req, {} as never, {
        primaryKey: "StatusId",
      }),
    ).rejects.toThrow(
      "updateHandler: Field StatusId is reserved when primaryKey is configured; use params.id and omit the original primary key from writes",
    );
  });
});
