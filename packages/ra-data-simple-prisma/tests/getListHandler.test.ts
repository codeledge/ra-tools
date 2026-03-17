import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getListHandler } from "../src/getListHandler";
import type { GetListRequest } from "../src/Http";

jest.mock("../src/getModel");
jest.mock("../src/extractWhere");
jest.mock("../src/extractOrderBy");
jest.mock("../src/extractSkipTake");

import { extractOrderBy } from "../src/extractOrderBy";
import { extractSkipTake } from "../src/extractSkipTake";
import { extractWhere } from "../src/extractWhere";
import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockExtractWhere = extractWhere as jest.MockedFunction<typeof extractWhere>;
const mockExtractOrderBy = extractOrderBy as jest.MockedFunction<typeof extractOrderBy>;
const mockExtractSkipTake = extractSkipTake as jest.MockedFunction<typeof extractSkipTake>;

function makeReq(overrides: Partial<GetListRequest["params"]> = {}): GetListRequest {
  return {
    method: "getList",
    resource: "post",
    params: {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
      filter: {},
      ...overrides,
    },
  };
}

function makeMockModel() {
  return {
    findMany: jest.fn().mockResolvedValue([{ id: 1, title: "A" }] as never),
    count: jest.fn().mockResolvedValue(1 as never),
  };
}

describe("getListHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractWhere.mockReturnValue({} as never);
    mockExtractOrderBy.mockReturnValue({ id: "asc" } as never);
    mockExtractSkipTake.mockReturnValue({ skip: 0, take: 10 } as never);
  });

  test("calls findMany/count with merged where, orderBy, and pagination", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockExtractWhere.mockReturnValue({ status: "client" } as never);

    await getListHandler(makeReq(), {} as never, {
      where: { status: "server" },
      include: { comments: true },
      select: { id: true },
    });

    expect(model.findMany).toHaveBeenCalledWith({
      include: { comments: true },
      orderBy: { id: "asc" },
      select: { id: true },
      skip: 0,
      take: 10,
      where: { status: "server" },
    });

    expect(model.count).toHaveBeenCalledWith({
      where: { status: "server" },
    });
  });

  test("uses options.orderBy and skips request sort extraction when provided", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getListHandler(makeReq(), {} as never, {
      orderBy: { createdAt: "desc" },
    });

    expect(mockExtractOrderBy).not.toHaveBeenCalled();
    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
  });

  test("adds not-null constraint for sorted field in noNullsOnSort", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockExtractWhere.mockReturnValue({ status: "client" } as never);

    await getListHandler(makeReq({ sort: { field: "title", order: "ASC" } }), {} as never, {
      where: { status: "server" },
      noNullsOnSort: ["title"],
    });

    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "server", title: { not: null } },
      }),
    );

    expect(model.count).toHaveBeenCalledWith({
      where: { status: "server", title: { not: null } },
    });
  });

  test("applies transformRow to each row", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, title: "A" },
        { id: 2, title: "B" },
      ] as never),
      count: jest.fn().mockResolvedValue(2 as never),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await getListHandler(makeReq(), {} as never, {
      transformRow: async (row) => ({ ...row, title: row.title.toLowerCase() }),
    });

    expect(result.data).toEqual([
      { id: 1, title: "a" },
      { id: 2, title: "b" },
    ]);
    expect(result.total).toBe(2);
  });

  test("maps custom primaryKey to id in response and removes original key", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([{ StatusId: 10, name: "Published" }] as never),
      count: jest.fn().mockResolvedValue(1 as never),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await getListHandler(makeReq(), {} as never, {
      primaryKey: "StatusId",
    });

    expect(result.data[0]).toEqual({ id: 10, name: "Published" });
    expect(result.data[0]).not.toHaveProperty("StatusId");
  });

  test("debug logs requestWhere, queryArgs, and total", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockExtractWhere.mockReturnValue({ status: "active" } as never);

    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await getListHandler(makeReq(), {} as never, { debug: true });

    expect(debugSpy).toHaveBeenCalledWith("getListHandler:requestWhere", expect.any(String));
    expect(logSpy).toHaveBeenCalledWith("getListHandler:queryArgs", expect.any(String));
    expect(logSpy).toHaveBeenCalledWith("getListHandler:total", 1);
  });
});
