import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getManyReferenceHandler } from "../src/getManyReferenceHandler";
import type { GetManyReferenceRequest } from "../src/Http";

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

function makeReq(overrides: Partial<GetManyReferenceRequest["params"]> = {}): GetManyReferenceRequest {
  return {
    method: "getManyReference",
    resource: "comment",
    params: {
      id: 7,
      target: "postId",
      filter: {},
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
      ...overrides,
    },
  };
}

function makeModel() {
  return {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, body: "first" },
      { id: 2, body: "second" },
    ] as never),
    count: jest.fn().mockResolvedValue(2 as never),
  };
}

describe("getManyReferenceHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractWhere.mockReturnValue({ status: "approved" } as never);
    mockExtractOrderBy.mockReturnValue({ createdAt: "desc" } as never);
    mockExtractSkipTake.mockReturnValue({ skip: 10, take: 10 } as never);
  });

  test("queries findMany and count with target id merged into where", async () => {
    const model = makeModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyReferenceHandler(makeReq(), {} as never, {
      include: { author: true },
      select: { id: true },
      filterMode: "insensitive",
    });

    expect(mockExtractWhere).toHaveBeenCalledWith(expect.any(Object), {
      filterMode: "insensitive",
    });
    expect(model.findMany).toHaveBeenCalledWith({
      include: { author: true },
      select: { id: true },
      where: { postId: 7, status: "approved" },
      orderBy: { createdAt: "desc" },
      skip: 10,
      take: 10,
    });
    expect(model.count).toHaveBeenCalledWith({ where: { postId: 7, status: "approved" } });
    expect(result).toEqual({
      data: [
        { id: 1, body: "first" },
        { id: 2, body: "second" },
      ],
      total: 2,
    });
  });

  test("applies transformRow when provided", async () => {
    const model = makeModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyReferenceHandler(makeReq(), {} as never, {
      transformRow: async (row) => ({ ...row, body: row.body.toUpperCase() }),
    });

    expect(result.data).toEqual([
      { id: 1, body: "FIRST" },
      { id: 2, body: "SECOND" },
    ]);
  });

  test("maps custom primaryKey to id in response", async () => {
    const model = {
      findMany: jest.fn().mockResolvedValue([
        { CommentId: 11, body: "first" },
        { CommentId: 12, body: "second" },
      ] as never),
      count: jest.fn().mockResolvedValue(2 as never),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await getManyReferenceHandler(makeReq(), {} as never, {
      primaryKey: "CommentId",
    });

    expect(result.data).toEqual([
      { id: 11, body: "first" },
      { id: 12, body: "second" },
    ]);
  });
});
