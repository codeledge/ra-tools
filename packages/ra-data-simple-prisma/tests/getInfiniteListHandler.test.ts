import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getInfiniteListHandler } from "../src/getInfiniteListHandler";
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
      pagination: { page: 1, perPage: 2 },
      sort: { field: "id", order: "ASC" },
      filter: {},
      ...overrides,
    },
  };
}

function makeMockModel() {
  return {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, title: "A" },
      { id: 2, title: "B" },
      { id: 3, title: "C" },
    ] as never),
  };
}

describe("getInfiniteListHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractWhere.mockReturnValue({} as never);
    mockExtractOrderBy.mockReturnValue({ id: "asc" } as never);
    mockExtractSkipTake.mockReturnValue({ skip: 0, take: 2 } as never);
  });

  test("calls findMany with merged where, orderBy, and take + 1", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockExtractWhere.mockReturnValue({ status: "client" } as never);

    await getInfiniteListHandler(makeReq(), {} as never, {
      where: { status: "server" },
      include: { comments: true },
      select: { id: true },
    });

    expect(model.findMany).toHaveBeenCalledWith({
      include: { comments: true },
      orderBy: { id: "asc" },
      select: { id: true },
      skip: 0,
      take: 3,
      where: { status: "server" },
    });
  });

  test("uses options.orderBy and skips request sort extraction when provided", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getInfiniteListHandler(makeReq(), {} as never, {
      orderBy: { createdAt: "desc" },
    });

    expect(mockExtractOrderBy).not.toHaveBeenCalled();
    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
  });

  test("adds not-null constraint for sorted field in noNullsOnSort", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockExtractWhere.mockReturnValue({ status: "client" } as never);

    await getInfiniteListHandler(makeReq({ sort: { field: "title", order: "ASC" } }), {} as never, {
      where: { status: "server" },
      noNullsOnSort: ["title"],
    });

    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "server", title: { not: null } },
      }),
    );
  });

  test("returns pageInfo with next page and slices extra record", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getInfiniteListHandler(makeReq(), {} as never);

    expect(result).toEqual({
      data: [
        { id: 1, title: "A" },
        { id: 2, title: "B" },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  test("returns hasPreviousPage when skip is greater than zero", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([
        { id: 3, title: "C" },
        { id: 4, title: "D" },
      ] as never),
    };
    mockGetModel.mockReturnValue(model as never);
    mockExtractSkipTake.mockReturnValue({ skip: 2, take: 2 } as never);

    const result = await getInfiniteListHandler(makeReq(), {} as never);

    expect(result.pageInfo).toEqual({
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });

  test("applies transformRow to returned rows", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, title: "A" },
        { id: 2, title: "B" },
      ] as never),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await getInfiniteListHandler(makeReq(), {} as never, {
      transformRow: async (row) => ({ ...row, title: row.title.toLowerCase() }),
    });

    expect(result.data).toEqual([
      { id: 1, title: "a" },
      { id: 2, title: "b" },
    ]);
  });

  test("maps custom primaryKey to id in response and removes original key", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([
        { StatusId: 10, name: "Published" },
        { StatusId: 20, name: "Draft" },
      ] as never),
    };
    mockGetModel.mockReturnValue(model as never);
    mockExtractSkipTake.mockReturnValue({ skip: 0, take: 5 } as never);

    const result = await getInfiniteListHandler(makeReq(), {} as never, {
      primaryKey: "StatusId",
    });

    expect(result.data).toEqual([
      { id: 10, name: "Published" },
      { id: 20, name: "Draft" },
    ]);
    expect(result.data[0]).not.toHaveProperty("StatusId");
  });

  test("debug logs requestWhere and queryArgs", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockExtractWhere.mockReturnValue({ status: "active" } as never);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await getInfiniteListHandler(makeReq(), {} as never, { debug: true });

    expect(logSpy).toHaveBeenCalledWith("getInfiniteListHandler:requestWhere", expect.any(String));
    expect(logSpy).toHaveBeenCalledWith("getInfiniteListHandler:queryArgs", expect.any(String));
  });
});
