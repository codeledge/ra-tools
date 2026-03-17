import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getOneHandler } from "../src/getOneHandler";
import type { GetOneRequest } from "../src/Http";

jest.mock("../src/getModel");

import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;

function makeReq(id: string | number, resource = "post"): GetOneRequest {
  return {
    method: "getOne",
    resource,
    params: { id },
  };
}

function makeMockModel() {
  return {
    findUnique: jest.fn().mockResolvedValue({ id: 1, title: "Post" } as never),
  };
}

describe("getOneHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("calls model.findUnique with where { id } and returns { data }", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getOneHandler(makeReq(42), {} as never);

    expect(model.findUnique).toHaveBeenCalledWith({
      where: { id: 42 },
      select: undefined,
      include: undefined,
    });
    expect(result).toEqual({ data: { id: 1, title: "Post" } });
  });

  test("passes select option to model.findUnique", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getOneHandler(makeReq(1), {} as never, { select: { id: true, title: true } });

    expect(model.findUnique).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true, title: true } }));
  });

  test("passes include option to model.findUnique", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getOneHandler(makeReq(1), {} as never, { include: { comments: true } });

    expect(model.findUnique).toHaveBeenCalledWith(expect.objectContaining({ include: { comments: true } }));
  });

  test("applies sync transform before returning response", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getOneHandler(makeReq(1), {} as never, {
      transform: (row) => ({ ...row, slug: "post-1" }),
    });

    expect(result).toEqual({ data: { id: 1, title: "Post", slug: "post-1" } });
  });

  test("applies async transform before returning response", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const result = await getOneHandler(makeReq(1), {} as never, {
      transform: async (row) => ({ ...row, loaded: await Promise.resolve(true) }),
    });

    expect(result).toEqual({ data: { id: 1, title: "Post", loaded: true } });
  });

  test("returns null data when model.findUnique returns null", async () => {
    const model = {
      findUnique: jest.fn().mockResolvedValue(null as never),
    };
    mockGetModel.mockReturnValue(model as never);

    const result = await getOneHandler(makeReq(999), {} as never);

    expect(result).toEqual({ data: null });
  });

  test("debug logs where, beforeTransform, and afterTransform", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await getOneHandler(makeReq(42), {} as never, { debug: true });

    expect(consoleSpy).toHaveBeenCalledWith("getOneHandler:where", { id: 42 });
    expect(consoleSpy).toHaveBeenCalledWith("getOneHandler:beforeTransform", { id: 1, title: "Post" });
    expect(consoleSpy).toHaveBeenCalledWith("getOneHandler:afterTransform", { id: 1, title: "Post" });
  });

  test("uses string ids as-is in where clause", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await getOneHandler(makeReq("abc-123"), {} as never);

    expect(model.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "abc-123" } }));
  });
});
