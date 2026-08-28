import {
  DuckDBConnection,
  DuckDBInstance,
} from "@duckdb/node-api";
import { createHandler } from "../src/createHandler";
import { defaultHandler } from "../src/defaultHandler";
import {
  DuckDBExecutor,
  fromDuckDBConnection,
} from "../src/duckdb";
import { extractWhere } from "../src/extractWhere";
import { getListHandler } from "../src/getListHandler";
import { getOneHandler } from "../src/getOneHandler";
import { NotFoundError } from "../src/lib/NotFoundError";
import { quoteIdent } from "../src/lib/quoteIdent";
import { updateHandler } from "../src/updateHandler";
import { deleteHandler } from "../src/deleteHandler";

let connection: DuckDBConnection;
let db: DuckDBExecutor;

beforeEach(async () => {
  const instance = await DuckDBInstance.create(":memory:");
  connection = await instance.connect();
  db = fromDuckDBConnection(connection);

  await db.run("CREATE SEQUENCE users_id_seq START 4");
  await db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
      name VARCHAR NOT NULL,
      age INTEGER,
      active BOOLEAN DEFAULT false
    )
  `);
  await db.run(`
    INSERT INTO users (id, name, age, active)
    VALUES
      (1, 'Alice', 30, false),
      (2, 'Bob', 25, false),
      (3, 'Carol', 40, false)
  `);

  await db.run("CREATE SEQUENCE custom_users_id_seq START 4");
  await db.run(`
    CREATE TABLE custom_users (
      user_key INTEGER PRIMARY KEY DEFAULT nextval('custom_users_id_seq'),
      name VARCHAR NOT NULL
    )
  `);
  await db.run(`
    INSERT INTO custom_users (user_key, name)
    VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Carol')
  `);

  await db.run(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR NOT NULL
    )
  `);
  await db.run(`
    INSERT INTO posts VALUES
      (1, 1, 'First'),
      (2, 1, 'Second'),
      (3, 2, 'Third')
  `);
});

afterEach(() => {
  connection.disconnectSync();
});

describe("quoteIdent", () => {
  it("quotes valid identifiers", () => {
    expect(quoteIdent("users")).toBe('"users"');
  });

  it("rejects invalid identifiers", () => {
    expect(() => quoteIdent('users; drop')).toThrow();
  });
});

describe("extractWhere", () => {
  it("builds equality and range filters", () => {
    const where = extractWhere({
      method: "getList",
      resource: "users",
      params: {
        filter: { age_gte: 30, name: "Al" },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    } as any);

    expect(where.sql).toContain('"age" >= $p1');
    expect(where.sql).toContain("LIKE");
    expect(where.params.p1).toBe(30);
  });

  it("supports OR groups without colliding params", () => {
    const where = extractWhere({
      method: "getList",
      resource: "users",
      params: {
        filter: {
          OR: [{ age_gte: 30 }, { name_eq: "Bob" }],
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    } as any);

    expect(where.sql).toContain(" OR ");
    expect(where.params.p1).toBe(30);
    expect(where.params.p2).toBe("Bob");
  });

  it("turns empty lists into an always-false condition", () => {
    const where = extractWhere({
      method: "getList",
      resource: "users",
      params: {
        filter: { id_in: [] },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    } as any);

    expect(where).toEqual({ sql: "WHERE FALSE", params: {} });
  });

  it("uses IN for plain array filters on id-like fields", () => {
    const where = extractWhere({
      method: "getList",
      resource: "posts",
      params: {
        filter: { id: [1, 2], user_id: [1, 2], authorId: [3] },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    } as any);

    expect(where.sql).toContain('"id" IN ($p1, $p2)');
    expect(where.sql).toContain('"user_id" IN ($p3, $p4)');
    expect(where.sql).toContain('"authorId" IN ($p5)');
    expect(where.params).toEqual({
      p1: 1,
      p2: 2,
      p3: 1,
      p4: 2,
      p5: 3,
    });
  });

  it("rejects nested filters instead of querying the wrong column", () => {
    expect(() =>
      extractWhere({
        method: "getList",
        resource: "users",
        params: {
          filter: { profile: { city: "Rome" } },
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        },
      } as any),
    ).toThrow('Nested filter "profile" is not supported');
  });
});

describe("DuckDB integration", () => {
  it("getList applies filters, sorting, pagination, and count", async () => {
    const result = await getListHandler(
      {
        method: "getList",
        resource: "users",
        params: {
          filter: { age_gte: 30 },
          pagination: { page: 1, perPage: 1 },
          sort: { field: "age", order: "DESC" },
        },
      },
      db,
    );

    expect(result.data).toEqual([
      expect.objectContaining({ id: 3, name: "Carol" }),
    ]);
    expect(result.total).toBe(2);
  });

  it("getOne / create / update / delete round-trip", async () => {
    const one = await getOneHandler(
      { method: "getOne", resource: "users", params: { id: 1 } },
      db,
    );
    expect(one.data.name).toBe("Alice");

    const created = await createHandler(
      {
        method: "create",
        resource: "users",
        params: { data: { name: "Dave", age: 22 } },
      },
      db,
    );
    expect(created.data.name).toBe("Dave");
    expect(created.data.id).toBeDefined();

    const updated = await updateHandler(
      {
        method: "update",
        resource: "users",
        params: {
          id: created.data.id,
          data: { id: created.data.id, name: "David", age: 23 },
          previousData: created.data,
        },
      },
      db,
    );
    expect(updated.data.name).toBe("David");

    const deleted = await deleteHandler(
      {
        method: "delete",
        resource: "users",
        params: { id: created.data.id, previousData: updated.data },
      },
      db,
    );
    expect(deleted.data.id).toBe(created.data.id);
  });

  it("handles updateMany and deleteMany against DuckDB", async () => {
    const updated = await defaultHandler(
      {
        method: "updateMany",
        resource: "users",
        params: { ids: [1, 2], data: { active: true } },
      },
      db,
    );
    expect(updated.data).toEqual([1, 2]);

    const rows = await defaultHandler(
      {
        method: "getMany",
        resource: "users",
        params: { ids: [1, 2] },
      },
      db,
    );
    expect(rows.data).toEqual([
      expect.objectContaining({ id: 1, active: true }),
      expect.objectContaining({ id: 2, active: true }),
    ]);

    const deleted = await defaultHandler(
      {
        method: "deleteMany",
        resource: "users",
        params: { ids: [1, 2] },
      },
      db,
    );
    expect(deleted.data).toEqual([1, 2]);

    const remaining = await db.all<{ id: number }>(
      "SELECT id FROM users ORDER BY id",
    );
    expect(remaining).toEqual([{ id: 3 }]);
  });

  it("maps custom primary keys without writing the synthetic id", async () => {
    const options = {
      resourceToTableMap: { users: "custom_users" },
      getOne: { primaryKey: "user_key" },
      create: { primaryKey: "user_key" },
      update: { primaryKey: "user_key" },
    };

    const one = await defaultHandler(
      { method: "getOne", resource: "users", params: { id: 1 } },
      db,
      options,
    );
    expect(one.data).toEqual({ id: 1, name: "Alice" });

    const updated = await defaultHandler(
      {
        method: "update",
        resource: "users",
        params: {
          id: 1,
          data: { ...one.data, name: "Alicia" },
          previousData: one.data,
        },
      },
      db,
      options,
    );
    expect(updated.data).toEqual({ id: 1, name: "Alicia" });

    const created = await defaultHandler(
      {
        method: "create",
        resource: "users",
        params: { data: { id: 999, name: "Dave" } },
      },
      db,
      options,
    );
    expect(created.data).toEqual({ id: 4, name: "Dave" });
  });

  it("gets referenced records with the correct total", async () => {
    const result = await defaultHandler(
      {
        method: "getManyReference",
        resource: "posts",
        params: {
          id: 1,
          target: "user_id",
          filter: {},
          pagination: { page: 1, perPage: 1 },
          sort: { field: "id", order: "DESC" },
        },
      },
      db,
    );

    expect(result.data).toEqual([
      expect.objectContaining({ id: 2, title: "Second" }),
    ]);
    expect("total" in result && result.total).toBe(2);
  });

  it("filters id-like array fields with IN against DuckDB", async () => {
    const result = await getListHandler(
      {
        method: "getList",
        resource: "posts",
        params: {
          filter: { user_id: [1] },
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        },
      },
      db,
    );

    expect(result.total).toBe(2);
    expect(result.data).toEqual([
      expect.objectContaining({ id: 1, user_id: 1 }),
      expect.objectContaining({ id: 2, user_id: 1 }),
    ]);
  });

  it("throws NotFoundError when getOne/update miss the row", async () => {
    await expect(
      getOneHandler(
        { method: "getOne", resource: "users", params: { id: 999 } },
        db,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);

    await expect(
      updateHandler(
        {
          method: "update",
          resource: "users",
          params: {
            id: 999,
            data: { name: "Missing" },
            previousData: { id: 999, name: "x" },
          },
        },
        db,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
