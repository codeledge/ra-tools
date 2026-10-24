import { DuckDBInstance } from "@duckdb/node-api";
import {
  defaultHandler,
  DuckDBExecutor,
  fromDuckDBConnection,
  NotFoundError,
} from "ra-data-duckdb/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const globalForDuckDB = globalThis as typeof globalThis & {
  duckDBDemo?: Promise<DuckDBExecutor>;
};

const createDatabase = async (): Promise<DuckDBExecutor> => {
  const instance = await DuckDBInstance.create(":memory:");
  const connection = await instance.connect();
  const db = fromDuckDBConnection(connection);

  await db.run("CREATE SEQUENCE users_id_seq START 4");
  await db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
      name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      age INTEGER,
      active BOOLEAN DEFAULT true
    )
  `);
  await db.run(`
    INSERT INTO users (id, name, email, age, active)
    VALUES
      (1, 'Ada Lovelace', 'ada@example.com', 36, true),
      (2, 'Grace Hopper', 'grace@example.com', 85, true),
      (3, 'Alan Turing', 'alan@example.com', 41, false)
  `);

  return db;
};

const getDatabase = () => {
  globalForDuckDB.duckDBDemo ??= createDatabase();
  return globalForDuckDB.duckDBDemo;
};

const handler = async (request: Request) => {
  try {
    const payload = await request.json();
    const db = await getDatabase();
    const result = await defaultHandler(payload, db, {
      getList: { searchColumns: ["name", "email"] },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof NotFoundError ? error.status : 400;
    return NextResponse.json({ message }, { status });
  }
};

export { handler as POST };
