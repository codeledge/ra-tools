import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { createHandler } from "../src/createHandler";
import { defaultHandler } from "../src/defaultHandler";
import { extractOrderBy } from "../src/extractOrderBy";
import { extractSkipTake } from "../src/extractSkipTake";
import { extractWhere } from "../src/extractWhere";
import { getInfiniteListHandler } from "../src/getInfiniteListHandler";
import { getListHandler } from "../src/getListHandler";
import { getManyReferenceHandler } from "../src/getManyReferenceHandler";
import { getModel } from "../src/getModel";
import type {
  GetListRequest,
  GetManyReferenceRequest,
  RaPayload,
} from "../src/Http";
import { RDSPError } from "../src/RDSPError";

const listReq = (
  params: Partial<GetListRequest["params"]>,
  resource = "post",
): GetListRequest => ({
  method: "getList",
  resource,
  params: {
    pagination: { page: 1, perPage: 10 },
    sort: { field: "id", order: "ASC" },
    filter: {},
    ...params,
  },
});

const makeModel = () => ({
  findMany: jest.fn().mockResolvedValue([] as never),
  count: jest.fn().mockResolvedValue(0 as never),
  create: jest.fn().mockResolvedValue({ id: 1 } as never),
});

const isPolluted = () =>
  ["polluted", "isAdmin", "p1"].some((key) => key in Object.prototype);

afterEach(() => {
  for (const key of ["polluted", "isAdmin", "p1"]) {
    delete (Object.prototype as any)[key];
  }
});

describe("prototype pollution", () => {
  test.each([
    ["__proto__.p1"],
    ["a.__proto__.p1"],
    ["constructor.prototype.p1"],
    ["a.prototype.p1"],
  ])("sort field %s is rejected", (field) => {
    expect(() =>
      extractOrderBy(listReq({ sort: { field, order: "ASC" } })),
    ).toThrow(RDSPError);
    expect(isPolluted()).toBe(false);
  });

  test.each([
    [{ "a.__proto__.isAdmin": true }],
    [{ "a.__proto__.polluted": "x" }],
    [{ "a.__proto__.polluted_gte": 1 }],
    [{ "a.constructor.prototype.polluted": 1 }],
    [{ nested: { "b.__proto__.polluted": 1 } }],
    [{ OR: [{ __proto__x: 1, "a.b": 1 }] }],
  ])("filter %j is rejected", (filter) => {
    expect(() => extractWhere(listReq({ filter }))).toThrow(RDSPError);
    expect(isPolluted()).toBe(false);
  });

  test("raw OR fragments with a __proto__ key are rejected", () => {
    const filter = JSON.parse('{"OR":[{"__proto__":{"polluted":1}}]}');
    expect(() => extractWhere(listReq({ filter }))).toThrow(RDSPError);
  });

  test("invalid sort order is rejected", () => {
    expect(() =>
      extractOrderBy(listReq({ sort: { field: "id", order: "sideways" as any } })),
    ).toThrow("invalid sort order");
  });

  test("regular nested sort still works", () => {
    expect(
      extractOrderBy(listReq({ sort: { field: "author.name", order: "DESC" } })),
    ).toEqual({ author: { name: "desc" } });
  });
});

describe("route-bound resource", () => {
  const prisma = { post: makeModel(), user: makeModel() } as any;

  test("rejects a body resource that differs from the route resource", () => {
    const req = listReq({}, "user");
    expect(() => getModel(req, prisma, undefined, "post")).toThrow(
      'Request resource "user" does not match route resource "post"',
    );
  });

  test("defaultHandler enforces options.resource", async () => {
    await expect(
      defaultHandler(listReq({}, "user"), prisma, { resource: "post" }),
    ).rejects.toThrow("does not match route resource");
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  test("handlers enforce options.resource", async () => {
    await expect(
      createHandler(
        { method: "create", resource: "user", params: { data: {} } },
        prisma,
        { resource: "post" },
      ),
    ).rejects.toThrow("does not match route resource");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test("a matching resource is accepted", async () => {
    await defaultHandler(listReq({}, "post"), prisma, { resource: "post" });
    expect(prisma.post.findMany).toHaveBeenCalled();
  });

  test.each([["$queryRawUnsafe"], ["$transaction"], ["constructor"], ["toString"], ["__proto__"]])(
    "client internals like %s are never resolved as models",
    (resource) => {
      const client = {
        $queryRawUnsafe: jest.fn(),
        $transaction: jest.fn(),
      } as any;
      expect(() =>
        getModel({ ...listReq({}), resource } as RaPayload, client),
      ).toThrow(RDSPError);
    },
  );
});

describe("pagination", () => {
  test("getListHandler refuses requests without pagination", async () => {
    const model = makeModel();
    await expect(
      getListHandler(listReq({ pagination: undefined }), { post: model } as any),
    ).rejects.toThrow("pagination is required");
    expect(model.findMany).not.toHaveBeenCalled();
  });

  test("getInfiniteListHandler refuses requests without pagination", async () => {
    const model = makeModel();
    await expect(
      getInfiniteListHandler(listReq({ pagination: undefined }), {
        post: model,
      } as any),
    ).rejects.toThrow("pagination is required");
  });

  test("getManyReferenceHandler refuses requests without pagination", async () => {
    const model = makeModel();
    const req: GetManyReferenceRequest = {
      method: "getManyReference",
      resource: "comment",
      params: {
        target: "postId",
        id: 1,
        filter: {},
        sort: { field: "id", order: "ASC" },
        pagination: undefined as any,
      },
    };
    await expect(
      getManyReferenceHandler(req, { comment: model } as any),
    ).rejects.toThrow("pagination is required");
  });

  test.each([
    [{ page: 0, perPage: 10 }],
    [{ page: -1, perPage: 10 }],
    [{ page: 1, perPage: 0 }],
    [{ page: 1.5, perPage: 10 }],
    [{ page: 1, perPage: Number.NaN }],
    [{ page: "1", perPage: 10 }],
    [{ page: 1, perPage: 1001 }],
  ])("invalid pagination %j is rejected", (pagination) => {
    expect(() =>
      extractSkipTake(listReq({ pagination: pagination as any })),
    ).toThrow(RDSPError);
  });

  test("perPage up to the default max of 1000 (react-admin export) is allowed", () => {
    expect(
      extractSkipTake(listReq({ pagination: { page: 2, perPage: 1000 } })),
    ).toEqual({ skip: 1000, take: 1000 });
  });

  test("maxPerPage can be lowered per handler", async () => {
    const model = makeModel();
    await expect(
      getListHandler(
        listReq({ pagination: { page: 1, perPage: 100 } }),
        { post: model } as any,
        { maxPerPage: 50 },
      ),
    ).rejects.toThrow("exceeds the maximum of 50");
  });
});

describe("getManyReference scope", () => {
  test("a filter on the target field cannot replace the reference scope", async () => {
    const model = makeModel();
    const req: GetManyReferenceRequest = {
      method: "getManyReference",
      resource: "comment",
      params: {
        target: "authorId",
        id: 1,
        filter: { authorId: 999 },
        sort: { field: "id", order: "ASC" },
        pagination: { page: 1, perPage: 10 },
      },
    };

    await getManyReferenceHandler(req, { comment: model } as any);

    const expectedWhere = { AND: [{ authorId: 1 }, { authorId: 999 }] };
    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(model.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  test("an unsafe target is rejected", async () => {
    const req: GetManyReferenceRequest = {
      method: "getManyReference",
      resource: "comment",
      params: {
        target: "__proto__.polluted",
        id: 1,
        filter: {},
        sort: { field: "id", order: "ASC" },
        pagination: { page: 1, perPage: 10 },
      },
    };
    await expect(
      getManyReferenceHandler(req, { comment: makeModel() } as any),
    ).rejects.toThrow(RDSPError);
    expect(isPolluted()).toBe(false);
  });
});

describe("filterableFields / sortableFields", () => {
  const filterableFields = ["title", "status", "author.name"];

  test.each([
    [{ title: "x" }],
    [{ title_contains: "x" }],
    [{ status_eq: "DRAFT" }],
    [{ author: { name: "x" } }],
    [{ OR: [{ title: { contains: "x" } }, { status: "DRAFT" }] }],
    [{ OR: [{ author: { is: { name: "x" } } }] }],
    [{ title_not: { contains: "x" } }],
  ])("allowed filter %j passes", (filter) => {
    expect(() =>
      extractWhere(listReq({ filter }), { filterableFields }),
    ).not.toThrow();
  });

  test.each([
    [{ passwordHash: "x" }],
    [{ passwordHash_startsWith: "$2" }],
    [{ OR: [{ passwordHash: { startsWith: "$2" } }] }],
    [{ AND: [{ title: "x" }, { NOT: [{ secret: { equals: 1 } }] }] }],
    [{ author: { email: "x" } }],
    [{ OR: [{ author: { is: { email: "x" } } }] }],
    [{ title_not: { secret: "x" } }],
    [{ title_OR: [{ hidden: 1 }] }],
  ])("disallowed filter %j is rejected", (filter) => {
    expect(() =>
      extractWhere(listReq({ filter }), { filterableFields }),
    ).toThrow("is not allowed");
  });

  test("without an allowlist, raw OR filters keep working", () => {
    expect(
      extractWhere(
        listReq({ filter: { OR: [{ amount: { gte: 1000 } }, { status: "A" }] } }),
      ),
    ).toEqual({ OR: [{ amount: { gte: 1000 } }, { status: "A" }] });
  });

  test("sorting outside sortableFields is rejected", async () => {
    await expect(
      getListHandler(
        listReq({ sort: { field: "passwordHash", order: "ASC" } }),
        { post: makeModel() } as any,
        { sortableFields: ["id", "title"] },
      ),
    ).rejects.toThrow('sorting on "passwordHash" is not allowed');
  });

  test("handlers pass filterableFields through", async () => {
    await expect(
      getListHandler(
        listReq({ filter: { passwordHash_startsWith: "$2" } }),
        { post: makeModel() } as any,
        { filterableFields },
      ),
    ).rejects.toThrow('filtering on "passwordHash" is not allowed');
  });
});
