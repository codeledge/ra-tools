import { describe, expect, jest, test } from "@jest/globals";
import { createHandler } from "../src/createHandler";
import type { CreateRequest } from "../src/Http";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("../src/getModel");
jest.mock("../src/audit/auditHandler");

import { auditHandler } from "../src/audit/auditHandler";
import { getModel } from "../src/getModel";

const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockAuditHandler = auditHandler as jest.MockedFunction<typeof auditHandler>;

function makeReq(data: Record<string, unknown>, resource = "post"): CreateRequest {
  return {
    method: "create",
    resource,
    params: { data },
  };
}

function makeMockModel() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, title: "New Post" } as never),
  };
}

// ---------------------------------------------------------------------------
// Field filtering
// ---------------------------------------------------------------------------

describe("createHandler - field filtering", () => {
  test("passes scalar fields through and returns { data: created }", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ title: "Hello", count: 5 });
    const result = await createHandler(req, {} as never);

    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ data: { title: "Hello", count: 5 } }));
    expect(result).toEqual({ data: { id: 1, title: "New Post" } });
  });

  test("removes empty string fields before creating", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ title: "Keep", subtitle: "" });
    await createHandler(req, {} as never);

    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ data: { title: "Keep" } }));
  });

  test("removes _ prefixed fields (isNotField)", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ title: "Hi", _count: 3, _sum: 10 });
    await createHandler(req, {} as never);

    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ data: { title: "Hi" } }));
  });
});

// ---------------------------------------------------------------------------
// allowOnlyFields
// ---------------------------------------------------------------------------

describe("createHandler - allowOnlyFields", () => {
  test("keeps permitted fields", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ title: "Hi", safe: "yes" });
    await createHandler(req, {} as never, { allowOnlyFields: { title: true, safe: true } });

    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ data: { title: "Hi", safe: "yes" } }));
  });

  test("throws for a field not in the allow list", async () => {
    mockGetModel.mockReturnValue(makeMockModel() as never);

    const req = makeReq({ title: "Hi", extra: "bad" });
    await expect(createHandler(req, {} as never, { allowOnlyFields: { title: true } })).rejects.toThrow(
      "createHandler: Field extra is not allowed in create",
    );
  });

  test("empty string fields are removed before allowOnlyFields is checked", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    // "extra" would fail allowOnlyFields, but it has an empty value so it is removed first
    const req = makeReq({ title: "Hi", extra: "" });
    await expect(createHandler(req, {} as never, { allowOnlyFields: { title: true } })).resolves.toBeDefined();
  });

  test("_ prefixed fields are removed before allowOnlyFields is checked", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ title: "Hi", _count: 3 });
    await expect(createHandler(req, {} as never, { allowOnlyFields: { title: true } })).resolves.toBeDefined();
  });

  test("throws when payload includes the configured custom primary key field", async () => {
    mockGetModel.mockReturnValue(makeMockModel() as never);

    const req = makeReq({ title: "Hi", IrregularPrimaryKeyId: 42 });
    await expect(createHandler(req, {} as never, { primaryKey: "IrregularPrimaryKeyId" })).rejects.toThrow(
      "createHandler: Field IrregularPrimaryKeyId is reserved when primaryKey is configured; use id in responses and omit the original primary key from writes",
    );
  });
});

// ---------------------------------------------------------------------------
// connect option
// ---------------------------------------------------------------------------

describe("createHandler - connect option", () => {
  // implicit shortcut: connect: { tags: "id" }
  test("string shortcut maps array to { connect: [{id},...] }", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ tags: [1, 2, 3] });
    await createHandler(req, {} as never, { connect: { tags: "id" } });

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { tags: { connect: [{ id: 1 }, { id: 2 }, { id: 3 }] } },
      }),
    );
  });

  test("string shortcut maps single value to { connect: {id} }", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ category: 5 });
    await createHandler(req, {} as never, { connect: { category: "id" } });

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { category: { connect: { id: 5 } } },
      }),
    );
  });

  // implicit object connection: connect: { tagIds: { tags: "id" } }
  test("implicit object connection maps tagIds to tags.connect, removes tagIds", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ tagIds: [10, 20] });
    await createHandler(req, {} as never, { connect: { tagIds: { tags: "id" } } });

    const callData = (model.create.mock.calls[0] as [{ data: unknown }])[0].data;
    expect(callData).toEqual({
      tags: { connect: [{ id: 10 }, { id: 20 }] },
    });
    expect(callData).not.toHaveProperty("tagIds");
  });

  // explicit connection: connect: { mediaIds: { postToMediaRels: { media: "id" } } }
  test("explicit object connection builds create array and removes original key", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    const req = makeReq({ mediaIds: [5, 6] });
    await createHandler(req, {} as never, {
      connect: { mediaIds: { postToMediaRels: { media: "id" } } },
    });

    const callData = (model.create.mock.calls[0] as [{ data: unknown }])[0].data;
    expect(callData).toEqual({
      postToMediaRels: {
        create: [{ media: { connect: { id: 5 } } }, { media: { connect: { id: 6 } } }],
      },
    });
    expect(callData).not.toHaveProperty("mediaIds");
  });
});

// ---------------------------------------------------------------------------
// options forwarded to model.create
// ---------------------------------------------------------------------------

describe("createHandler - model options", () => {
  test("passes include to model.create", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await createHandler(makeReq({ title: "Hi" }), {} as never, { include: { tags: true } });

    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ include: { tags: true } }));
  });

  test("passes select to model.create", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);

    await createHandler(makeReq({ title: "Hi" }), {} as never, { select: { id: true, title: true } });

    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true, title: true } }));
  });
});

// ---------------------------------------------------------------------------
// debug
// ---------------------------------------------------------------------------

describe("createHandler - debug", () => {
  test("debug logs data before and after create", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await createHandler(makeReq({ title: "Debug" }), {} as never, { debug: true });

    expect(consoleSpy).toHaveBeenCalledWith("createHandler:data", { title: "Debug" });
    expect(consoleSpy).toHaveBeenCalledWith("createHandler:created", { id: 1, title: "New Post" });
  });
});

// ---------------------------------------------------------------------------
// audit
// ---------------------------------------------------------------------------

describe("createHandler - audit", () => {
  test("calls auditHandler with req, options, and created record", async () => {
    const model = makeMockModel();
    mockGetModel.mockReturnValue(model as never);
    mockAuditHandler.mockResolvedValue(undefined as never);

    const auditOptions = {
      model: { create: jest.fn() },
      authProvider: {} as never,
    };
    const req = makeReq({ title: "Audited" });
    await createHandler(req, {} as never, { audit: auditOptions });

    expect(mockAuditHandler).toHaveBeenCalledWith(req, auditOptions, { id: 1, title: "New Post" });
  });

  test("does not call auditHandler when audit option is absent", async () => {
    mockGetModel.mockReturnValue(makeMockModel() as never);

    await createHandler(makeReq({ title: "No audit" }), {} as never);

    expect(mockAuditHandler).not.toHaveBeenCalled();
  });
});
