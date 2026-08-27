# React Admin + DuckDB

Simple react-admin data provider backed by [DuckDB](https://duckdb.org/). Same request shape as `ra-data-simple-prisma`: the browser talks HTTP, the server runs SQL.

### Installation

```
pnpm i ra-data-duckdb @duckdb/node-api
```

### Frontend

```tsx
import { Admin, Resource } from "react-admin";
import { dataProvider } from "ra-data-duckdb";

const ReactAdmin = () => (
  <Admin dataProvider={dataProvider("/api")}>
    <Resource name="users" />
  </Admin>
);
```

### Backend (Next.js App Router)

```ts
// app/api/[resource]/route.ts
import { DuckDBInstance } from "@duckdb/node-api";
import { defaultHandler, fromDuckDBConnection } from "ra-data-duckdb/server";
import { NextResponse } from "next/server";

const instance = await DuckDBInstance.create("data.duckdb");
const connection = await instance.connect();
const db = fromDuckDBConnection(connection);

const handler = async (req: Request) => {
  const body = await req.json();
  const result = await defaultHandler(body, db, {
    // optional: map react-admin resource names to table names
    resourceToTableMap: { users: "app_users" },
  });
  return NextResponse.json(result);
};

export { handler as GET, handler as POST };
```

### Custom executor

Handlers take a minimal `DuckDBExecutor` (`all` / `run`). Use `fromDuckDBConnection` for `@duckdb/node-api`, or supply your own:

```ts
import { defaultHandler, DuckDBExecutor } from "ra-data-duckdb/server";

const db: DuckDBExecutor = {
  all: async (sql, params) => { /* ... */ },
  run: async (sql, params) => { /* ... */ },
};

await defaultHandler(body, db);
```

### Filters

Common react-admin filters are mapped to SQL:

| Filter | SQL |
| --- | --- |
| `age: 30` / `age_eq` | `"age" = $p` |
| `age_gte` / `_gt` / `_lte` / `_lt` | comparison |
| `name: "Al"` (string) | `LIKE '%Al%'` (case-insensitive by default) |
| `id_in: [1,2]` / array value | `IN (...)` |
| `q` + `searchColumns` | OR of LIKE across columns |
| `OR` / `AND` / `NOT` | grouped boolean |

Resource and column names are validated and quoted; only `[A-Za-z_][A-Za-z0-9_]*` identifiers are allowed.

### Notes

- DuckDB is not ideal for high-concurrency multi-writer admin apps; prefer a single writer or an analytics/read-heavy use case.
- Audit logs and Prisma-style relation `include` / `connect` are not ported — keep v1 flat-table CRUD.
