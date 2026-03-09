import { describe, expect, jest, test } from "@jest/globals";
import type { UpdateRequest } from "../src/Http";
import { reduceData, updateHandler } from "../src/updateHandler";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("../src/getModel");
jest.mock("../src/audit/auditHandler");

import { auditHandler } from "../src/audit/auditHandler";
import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockAuditHandler = auditHandler as jest.MockedFunction<typeof auditHandler>;

function makeReq(id: string | number, data: Record<string, unknown>, resource = "post"): UpdateRequest {
  return {
    method: "update",
    resource,
    params: { id, data, previousData: {} },
  };
}

function makeMockModel() {
  return {
    update: jest.fn().mockResolvedValue({ id: 1, title: "Post" } as never),
  };
}

// ---------------------------------------------------------------------------
// reduceData — pure logic, no mocks needed
// ---------------------------------------------------------------------------

describe("reduceData", () => {
  test("passes scalar fields through", () => {
    const result = reduceData({ title: "Hello", count: 5 }, {});
    expect(result).toEqual({ title: "Hello", count: 5 });
  });

  test("passes array fields through when no set option matches", () => {
    const result = reduceData({ ids: [1, 2, 3] }, {});
    expect(result).toEqual({ ids: [1, 2, 3] });
  });

  test("skips fields that start with _ (isNotField)", () => {
    const result = reduceData({ title: "Hi", _count: 3, _sum: 10 }, {});
    expect(result).toEqual({ title: "Hi" });
  });

  test("skipFields removes specified fields", () => {
    const result = reduceData({ title: "Hi", secret: "s", other: "o" }, { skipFields: { secret: true } });
    expect(result).toEqual({ title: "Hi", other: "o" });
  });

  test("allowOnlyFields keeps permitted fields", () => {
    const result = reduceData({ title: "Hi", safe: "yes" }, { allowOnlyFields: { title: true, safe: true } });
    expect(result).toEqual({ title: "Hi", safe: "yes" });
  });

  test("allowOnlyFields throws for a field not in the allow list", () => {
    expect(() => reduceData({ title: "Hi", extra: "bad" }, { allowOnlyFields: { title: true } })).toThrow(
      "updateHandler: Field extra is not allowed in update",
    );
  });

  // set — implicit shortcut: set: { tags: "id" }
  test("set with string (implicit shortcut) transforms array to { set: [{id},...] }", () => {
    const result = reduceData({ tags: [1, 2, 3] }, { set: { tags: "id" } });
    expect(result).toEqual({
      tags: { set: [{ id: 1 }, { id: 2 }, { id: 3 }] },
    });
  });

  // set — implicit connection: set: { tagIds: { tags: "id" } }
  test("set with implicit object connection transforms tagIds to tags.set", () => {
    const result = reduceData({ tagIds: [10, 20] }, { set: { tagIds: { tags: "id" } } });
    expect(result).toEqual({
      tags: { set: [{ id: 10 }, { id: 20 }] },
    });
    // Original key is removed
    expect(result).not.toHaveProperty("tagIds");
  });

  // set — explicit connection: set: { mediaIds: { postToMediaRels: { media: "id" } } }
  test("set with explicit object connection builds deleteMany + create", () => {
    const result = reduceData({ mediaIds: [5, 6] }, { set: { mediaIds: { postToMediaRels: { media: "id" } } } });
    expect(result).toEqual({
      postToMediaRels: {
        deleteMany: {},
        create: [{ media: { connect: { id: 5 } } }, { media: { connect: { id: 6 } } }],
      },
    });
    expect(result).not.toHaveProperty("mediaIds");
  });

  // allowNestedUpdate
  test("allowNestedUpdate wraps object in { update: { data } }", () => {
    const result = reduceData({ profile: { bio: "hello" } }, { allowNestedUpdate: { profile: true } });
    expect(result).toEqual({
      profile: { update: { data: { bio: "hello" } } },
    });
  });

  // allowNestedUpsert
  test("allowNestedUpsert wraps object in { upsert: { create, update } }", () => {
    const result = reduceData({ profile: { bio: "hello" } }, { allowNestedUpsert: { profile: true } });
    expect(result).toEqual({
      profile: { upsert: { create: { bio: "hello" }, update: { bio: "hello" } } },
    });
  });

  // allowJsonUpdate
  test("allowJsonUpdate passes nested object through as-is", () => {
    const meta = { key: "value", nested: { a: 1 } };
    const result = reduceData({ meta }, { allowJsonUpdate: { meta: true } });
    expect(result).toEqual({ meta });
  });

  test("object field with no nested option is omitted from result", () => {
    const result = reduceData({ nested: { x: 1 } }, {});
    expect(result).not.toHaveProperty("nested");
  });
});

// ---------------------------------------------------------------------------
// updateHandler — integration with mocked getModel / auditHandler
// ---------------------------------------------------------------------------

describe("updateHandler", () => {
  test("calls model.update with data and where { id }, returns { data }", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq(42, { title: "Updated" });
    const result = await updateHandler(req, {} as never);

    expect(model.update).toHaveBeenCalledWith({
      data: { title: "Updated" },
      include: undefined,
      select: undefined,
      where: { id: 42 },
    });
    expect(result).toEqual({ data: { id: 1, title: "Post" } });
  });

  test("passes include option to model.update", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq(1, { title: "Hi" });
    await updateHandler(req, {} as never, { include: { comments: true } });

    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ include: { comments: true } }));
  });

  test("passes select option to model.update", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq(1, { title: "Hi" });
    await updateHandler(req, {} as never, { select: { id: true, title: true } });

    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true, title: true } }));
  });

  test("debug option logs the reduced data", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    const req = makeReq(1, { title: "Debug" });
    await updateHandler(req, {} as never, { debug: true });

    expect(consoleSpy).toHaveBeenCalledWith("updateHandler:data", {
      title: "Debug",
    });
  });

  test("audit option calls auditHandler", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockAuditHandler.mockResolvedValue(undefined as never);

    const auditOptions = {
      model: { create: jest.fn() },
      authProvider: {} as never,
    };
    const req = makeReq(1, { title: "Audited" });
    await updateHandler(req, {} as never, { audit: auditOptions });

    expect(mockAuditHandler).toHaveBeenCalledWith(req, auditOptions);
  });

  test("does not call auditHandler when audit option is absent", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq(1, { title: "No audit" });
    await updateHandler(req, {} as never);

    expect(mockAuditHandler).not.toHaveBeenCalled();
  });

  test("applies reduceData transformations: skipFields", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq(1, { title: "Keep", secret: "drop" });
    await updateHandler(req, {} as never, { skipFields: { secret: true } });

    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ data: { title: "Keep" } }));
  });

  test("applies reduceData transformations: set with string", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq(1, { tags: [1, 2] });
    await updateHandler(req, {} as never, { set: { tags: "id" } });

    expect(model.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { tags: { set: [{ id: 1 }, { id: 2 }] } },
      }),
    );
  });

  test("string id is forwarded as-is in where clause", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq("abc-123", { name: "Test" });
    await updateHandler(req, {} as never);

    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "abc-123" } }));
  });
});
