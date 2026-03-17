import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getManyHandler } from "../src/getManyHandler";
import type { GetManyRequest } from "../src/Http";

jest.mock("../src/getModel");

import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;

function makeReq(ids: Array<string | number>, resource = "post"): GetManyRequest {
  return {
    method: "getMany",
    resource,
    params: { ids },
  };
}

function makeMockModel() {
  return {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, title: "A" },
      { id: 2, title: "B" },
    ] as never),
  };
}

describe("getManyHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls model.findMany with where { id: { in: ids } } and returns data", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyHandler(makeReq([1, 2]), {} as never);

    expect(model.findMany).toHaveBeenCalledWith({
      include: undefined,
      select: undefined,
      where: { id: { in: [1, 2] } },
    });

    expect(result).toEqual({
      data: [
        { id: 1, title: "A" },
        { id: 2, title: "B" },
      ],
    });
  });

  test("passes include option to model.findMany", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getManyHandler(makeReq([1]), {} as never, {
      include: { comments: true },
    });

    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ include: { comments: true } }));
  });

  test("passes select option to model.findMany", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getManyHandler(makeReq([1]), {} as never, {
      select: { id: true, title: true },
    });

    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true, title: true } }));
  });

  test("applies sync transformRow to each row", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyHandler(makeReq([1, 2]), {} as never, {
      transformRow: (row) => ({ ...row, title: row.title.toLowerCase() }),
    });

    expect(result).toEqual({
      data: [
        { id: 1, title: "a" },
        { id: 2, title: "b" },
      ],
    });
  });

  test("applies async transformRow to each row", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyHandler(makeReq([1, 2]), {} as never, {
      transformRow: async (row) => ({ ...row, loaded: await Promise.resolve(true) }),
    });

    expect(result).toEqual({
      data: [
        { id: 1, title: "A", loaded: true },
        { id: 2, title: "B", loaded: true },
      ],
    });
  });

  test("uses custom primaryKey in where and maps response to id", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([
        { StatusId: 10, name: "Published" },
        { StatusId: 20, name: "Draft" },
      ] as never),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyHandler(makeReq([10, 20]), {} as never, {
      primaryKey: "StatusId",
    });

    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { StatusId: { in: [10, 20] } } }));

    expect(result.data).toEqual([
      { id: 10, name: "Published" },
      { id: 20, name: "Draft" },
    ]);
    expect(result.data[0]).not.toHaveProperty("StatusId");
    expect(result.data[1]).not.toHaveProperty("StatusId");
  });

  test("forwards string ids as-is", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getManyHandler(makeReq(["a", "b"]), {} as never);

    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: ["a", "b"] } } }));
  });
});
