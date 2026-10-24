import type { PGlite } from "@electric-sql/pglite";
import type { AuthProvider } from "react-admin";
import {
  bindDefaultHandler,
  createHandler,
  defaultHandler,
  deleteHandler,
  deleteManyHandler,
  getInfiniteListHandler,
  getListHandler,
  getManyHandler,
  getManyReferenceHandler,
  getOneHandler,
  updateHandler,
  updateManyHandler,
} from "../src/server";
import { auditLogs, createTestDb, type TestDb } from "./db";

let db: TestDb;
let client: PGlite;

beforeEach(async () => {
  ({ db, client } = await createTestDb());
});

afterEach(async () => {
  await client.close();
});

const list = (resource: string, filter: any = {}, extra: any = {}) =>
  ({
    method: "getList",
    resource,
    params: {
      filter,
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
      ...extra,
    },
  } as any);

const ids = (rows: any[]) => rows.map((row) => row.id);

describe("getListHandler", () => {
  it("lists with total, pagination and sort", async () => {
    const res = await getListHandler(
      list(
        "users",
        {},
        {
          pagination: { page: 2, perPage: 2 },
          sort: { field: "name", order: "DESC" },
        },
      ),
      db,
    );
    expect(res.total).toBe(4);
    expect(res.data.map((u) => u.name)).toEqual(["Bob", "Alice"]);
  });

  it("bare string filter is case insensitive contains", async () => {
    const res = await getListHandler(list("users", { name: "AL" }), db);
    expect(res.data.map((u) => u.name)).toEqual(["Alice", "alfred"]);
    expect(res.total).toBe(2);
  });

  it("filterMode default is case sensitive", async () => {
    const res = await getListHandler(list("users", { name: "al" }), db, {
      filterMode: "default",
    });
    expect(res.data.map((u) => u.name)).toEqual(["alfred"]);
  });

  it("@ operators", async () => {
    expect(
      ids((await getListHandler(list("users", { "age@gte": 30 }), db)).data),
    ).toEqual([1, 4]);
    expect(
      ids(
        (await getListHandler(list("users", { "age@isNull": true }), db)).data,
      ),
    ).toEqual([3]);
    expect(
      ids(
        (await getListHandler(list("users", { "id@notIn": [1, 2] }), db)).data,
      ),
    ).toEqual([3, 4]);
    expect(
      ids(
        (
          await getListHandler(
            list("posts", { "tags@arrayContains": "sql" }),
            db,
          )
        ).data,
      ),
    ).toEqual([1, 2]);
    expect(
      ids(
        (await getListHandler(list("users", { "name@startsWith": "a" }), db))
          .data,
      ),
    ).toEqual([1, 4]);
  });

  it("@pgjson uses jsonb containment, @search full text", async () => {
    const pro = await getListHandler(
      list("users", { "meta@pgjson": { plan: "pro" } }),
      db,
    );
    expect(ids(pro.data)).toEqual([1, 4]);
    expect(pro.total).toBe(2);

    const dark = await getListHandler(
      list("users", { "meta@pgjson": { prefs: { theme: "dark" } } }),
      db,
    );
    expect(ids(dark.data)).toEqual([1]);

    const search = await getListHandler(
      list("posts", { "title@search": "writes" }),
      db,
    );
    expect(ids(search.data)).toEqual([3]);
  });

  it("relation filters, also counted correctly", async () => {
    const res = await getListHandler(
      list("posts", { author: { name: "ali" } }),
      db,
    );
    expect(ids(res.data)).toEqual([1, 2]);
    expect(res.total).toBe(2);

    const dotted = await getListHandler(
      list("posts", { "author.isActive@eq": false }),
      db,
    );
    expect(ids(dotted.data)).toEqual([3]);
    expect(dotted.total).toBe(1);
  });

  it("@pgjson inside OR / NOT keeps its semantics", async () => {
    const orRes = await getListHandler(
      list("users", {
        OR: [{ "meta@pgjson": { plan: "free" } }, { "name@eq": "Carol" }],
      }),
      db,
    );
    expect(ids(orRes.data)).toEqual([2, 3]);

    // NULL meta follows SQL three-valued logic: NOT NULL is NULL, so Carol is excluded
    const notRes = await getListHandler(
      list("users", { NOT: { "meta@pgjson": { plan: "pro" } } }),
      db,
    );
    expect(ids(notRes.data)).toEqual([2]);
  });

  it("OR / NOT", async () => {
    const res = await getListHandler(
      list("users", {
        OR: [{ "age@lt": 26 }, { "age@gt": 40 }],
        NOT: { name: "bob" },
      }),
      db,
    );
    expect(ids(res.data)).toEqual([4]);
    expect(res.total).toBe(1);
  });

  it("server where is ANDed and can't be loosened by the request", async () => {
    const res = await getListHandler(
      list("users", { "isActive@eq": false }),
      db,
      {
        where: { isActive: { eq: true } },
      },
    );
    expect(res.data).toEqual([]);
    expect(res.total).toBe(0);

    const scoped = await getListHandler(list("users", { name: "a" }), db, {
      where: { age: { gte: 35 } },
    });
    expect(ids(scoped.data)).toEqual([4]);
    expect(scoped.total).toBe(1);
  });

  it("columns, with, transformRow(s), server orderBy", async () => {
    const res = await getListHandler(list("posts"), db, {
      columns: { id: true, title: true },
      with: { author: { columns: { name: true } } },
      orderBy: { id: "desc" },
      transformRow: (row) => ({ ...row, upper: row.title.toUpperCase() }),
      transformRows: (rows) => rows.slice(0, 2),
    });
    expect(res.total).toBe(4);
    expect(res.data).toEqual([
      { id: 4, title: "Orphan", author: null, upper: "ORPHAN" },
      {
        id: 3,
        title: "Bob writes",
        author: { name: "Bob" },
        upper: "BOB WRITES",
      },
    ]);
  });

  it("noNullsOnSort", async () => {
    const res = await getListHandler(
      list("users", {}, { sort: { field: "age", order: "ASC" } }),
      db,
      { noNullsOnSort: ["age"] },
    );
    expect(ids(res.data)).toEqual([2, 1, 4]);
    expect(res.total).toBe(3);
  });

  it("primaryKey + resourceToTableMap", async () => {
    const res = await getListHandler(
      list("labels", {}, { sort: undefined }),
      db,
      {
        primaryKey: "slug",
        resourceToTableMap: { labels: "tags" },
      },
    );
    expect(res.data).toEqual([
      { id: "orm", label: "ORM" },
      { id: "sql", label: "SQL" },
    ]);
  });

  it("throws a helpful error for unknown resources", async () => {
    await expect(getListHandler(list("nope"), db)).rejects.toThrow(
      /No table found for "nope".*relations/,
    );
  });
});

describe("getInfiniteListHandler", () => {
  it("returns pageInfo", async () => {
    const first = await getInfiniteListHandler(
      list("users", {}, { pagination: { page: 1, perPage: 3 } }),
      db,
    );
    expect(ids(first.data)).toEqual([1, 2, 3]);
    expect(first.pageInfo).toEqual({
      hasPreviousPage: false,
      hasNextPage: true,
    });

    const second = await getInfiniteListHandler(
      list("users", {}, { pagination: { page: 2, perPage: 3 } }),
      db,
    );
    expect(ids(second.data)).toEqual([4]);
    expect(second.pageInfo).toEqual({
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });
});

describe("getOne / getMany / getManyReference", () => {
  it("getOne", async () => {
    const res = await getOneHandler(
      { method: "getOne", resource: "posts", params: { id: 1 } },
      db,
      { with: { author: true }, transform: (row) => ({ ...row, x: 1 }) },
    );
    expect(res.data).toMatchObject({ id: 1, x: 1, author: { name: "Alice" } });
  });

  it("getOne returns null when missing", async () => {
    const res = await getOneHandler(
      { method: "getOne", resource: "posts", params: { id: 999 } },
      db,
    );
    expect(res.data).toBeNull();
  });

  it("getMany", async () => {
    const res = await getManyHandler(
      { method: "getMany", resource: "users", params: { ids: [1, 3] } },
      db,
      { columns: { id: true, name: true } },
    );
    expect(res.data).toEqual([
      { id: 1, name: "Alice" },
      { id: 3, name: "Carol" },
    ]);
  });

  it("getManyReference with filter and count", async () => {
    const res = await getManyReferenceHandler(
      {
        method: "getManyReference",
        resource: "posts",
        params: {
          target: "authorId",
          id: 1,
          filter: { title: "post" },
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        },
      },
      db,
    );
    expect(ids(res.data)).toEqual([2]);
    expect(res.total).toBe(1);
  });
});

describe("writes", () => {
  it("create drops non columns, empty strings and converts dates", async () => {
    const res = await createHandler(
      {
        method: "create",
        resource: "posts",
        params: {
          data: {
            title: "New",
            authorId: 2,
            publishedAt: "2026-05-01T10:00:00.000Z",
            deletedAt: "",
            author: { id: 2, name: "Bob" },
            _helper: true,
          },
        },
      },
      db,
      { with: { author: { columns: { name: true } } } },
    );
    expect(res.data).toMatchObject({
      id: 5,
      title: "New",
      deletedAt: null,
      author: { name: "Bob" },
    });
    expect(res.data.publishedAt).toEqual(new Date("2026-05-01T10:00:00.000Z"));
  });

  it("create with natural primaryKey maps id and rejects the raw key", async () => {
    const res = await createHandler(
      {
        method: "create",
        resource: "tags",
        params: { data: { id: "db", label: "DB" } },
      },
      db,
      { primaryKey: "slug" },
    );
    expect(res.data).toEqual({ id: "db", label: "DB" });

    await expect(
      createHandler(
        {
          method: "create",
          resource: "tags",
          params: { data: { slug: "x", label: "X" } },
        },
        db,
        { primaryKey: "slug" },
      ),
    ).rejects.toThrow(/reserved/);
  });

  it("create allowOnlyFields", async () => {
    await expect(
      createHandler(
        {
          method: "create",
          resource: "users",
          params: { data: { name: "x", email: "x@x", age: 1 } },
        },
        db,
        { allowOnlyFields: { name: true, email: true } },
      ),
    ).rejects.toThrow("Field age is not allowed in create");
  });

  it("update ignores pk/relations, skipFields", async () => {
    const res = await updateHandler(
      {
        method: "update",
        resource: "users",
        params: {
          id: 1,
          data: { id: 1, name: "Alicia", age: 99, posts: [] },
          previousData: { id: 1 },
        },
      },
      db,
      { skipFields: { age: true } },
    );
    expect(res.data).toMatchObject({ id: 1, name: "Alicia", age: 30 });
  });

  it("update with nothing to set returns the row", async () => {
    const res = await updateHandler(
      {
        method: "update",
        resource: "users",
        params: { id: 2, data: { id: 2 }, previousData: { id: 2 } },
      },
      db,
    );
    expect(res.data).toMatchObject({ id: 2, name: "Bob" });
  });

  it("update with custom primaryKey", async () => {
    const res = await updateHandler(
      {
        method: "update",
        resource: "tags",
        params: {
          id: "orm",
          data: { id: "orm", label: "Orm!" },
          previousData: {},
        },
      },
      db,
      { primaryKey: "slug" },
    );
    expect(res.data).toEqual({ id: "orm", label: "Orm!" });
  });

  it("updateMany", async () => {
    const res = await updateManyHandler(
      {
        method: "updateMany",
        resource: "users",
        params: { ids: [1, 2], data: { isActive: false } },
      },
      db,
    );
    expect(res.data).toEqual([1, 2]);
    const check = await getListHandler(
      list("users", { "isActive@eq": false }),
      db,
    );
    expect(ids(check.data)).toEqual([1, 2]);
  });

  it("delete and soft delete", async () => {
    const soft = await deleteHandler(
      { method: "delete", resource: "posts", params: { id: 2 } },
      db,
      { softDeleteField: "deletedAt" },
    );
    expect(soft.data.deletedAt).toBeInstanceOf(Date);

    const hard = await deleteHandler(
      { method: "delete", resource: "posts", params: { id: 4 } },
      db,
    );
    expect(hard.data).toMatchObject({ id: 4, title: "Orphan" });
    expect((await getListHandler(list("posts"), db)).total).toBe(3);
  });

  it("deleteMany returns the deleted ids", async () => {
    const res = await deleteManyHandler(
      { method: "deleteMany", resource: "posts", params: { ids: [3, 4, 999] } },
      db,
    );
    expect(res.data.sort()).toEqual([3, 4]);
  });
});

describe("audit", () => {
  const authProvider = {
    getIdentity: async () => ({ id: "admin-1" }),
  } as unknown as AuthProvider;

  const auditRows = () => db.select().from(auditLogs).orderBy(auditLogs.id);

  it("logs create, update, updateMany and deleteMany", async () => {
    const audit = { table: auditLogs, authProvider };

    await defaultHandler(
      {
        method: "create",
        resource: "tags",
        params: { data: { id: "new", label: "New" } },
      },
      db,
      { audit, create: { primaryKey: "slug" } },
    );
    await defaultHandler(
      {
        method: "update",
        resource: "users",
        params: { id: 1, data: { name: "A" }, previousData: { name: "Alice" } },
      },
      db,
      { audit },
    );
    await defaultHandler(
      {
        method: "updateMany",
        resource: "users",
        params: { ids: [2, 3], data: { age: 1 } },
      },
      db,
      { audit },
    );
    await defaultHandler(
      { method: "deleteMany", resource: "posts", params: { ids: [4] } },
      db,
      { audit },
    );

    const rows = await auditRows();
    expect(
      rows.map((r) => [
        r.action,
        r.resource,
        (r.payload as any).id,
        r.authorId,
      ]),
    ).toEqual([
      ["create", "tags", "new", "admin-1"],
      ["update", "users", 1, "admin-1"],
      ["update", "users", 2, "admin-1"],
      ["update", "users", 3, "admin-1"],
      ["delete", "posts", 4, "admin-1"],
    ]);
    expect((rows[1].payload as any).previousData).toEqual({ name: "Alice" });
    expect((rows[2].payload as any).previousData).toMatchObject({
      name: "Bob",
      age: 25,
    });
  });

  it("respects enabledForAction and enabledResources", async () => {
    const handler = bindDefaultHandler({
      db,
      audit: {
        table: auditLogs,
        authProvider,
        enabledForAction: { delete: false },
        enabledResources: ["posts"],
      },
    });
    await handler({ method: "delete", resource: "posts", params: { id: 4 } });
    await handler({
      method: "update",
      resource: "users",
      params: { id: 1, data: { name: "x" }, previousData: {} },
    });
    await handler({
      method: "update",
      resource: "posts",
      params: { id: 1, data: { title: "x" }, previousData: {} },
    });
    expect((await auditRows()).map((r) => [r.action, r.resource])).toEqual([
      ["update", "posts"],
    ]);
  });
});

describe("transactions", () => {
  it("bound handlers accept a tx via options.db", async () => {
    const handler = bindDefaultHandler({ db });
    await expect(
      db.transaction(async (tx) => {
        await handler(
          {
            method: "update",
            resource: "users",
            params: { id: 1, data: { name: "Rolled back" }, previousData: {} },
          },
          { db: tx as any },
        );
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");

    const res = await getOneHandler(
      { method: "getOne", resource: "users", params: { id: 1 } },
      db,
    );
    expect(res.data.name).toBe("Alice");
  });
});
