# React Admin + DuckDB

Simple react-admin data provider backed by [DuckDB](https://duckdb.org/). Same request shape as [`ra-data-simple-prisma`](../ra-data-simple-prisma/): the browser talks HTTP, the server runs SQL.

The package splits into two parts you wire together in your own stack:

1. **Browser** — `dataProvider` from `ra-data-duckdb` (POSTs `{ method, resource, params }` to your API)
2. **Server** — `defaultHandler` from `ra-data-duckdb/server` (runs SQL via `@duckdb/node-api`)

Expose the API with Express, Fastify, Hono, Next.js, Remix, or any Node HTTP server — one `POST /:resource` route per resource (or a catch-all) is enough.

Example app: [duckdb-admin](../../apps/duckdb-admin/) (Next.js App Router).

### Requirements

- [react-admin](https://marmelab.com/react-admin/) `>= 5.7.2`
- Node.js on the server (DuckDB runs server-side only)
- [`@duckdb/node-api`](https://www.npmjs.com/package/@duckdb/node-api) on the server (peer dependency)

### Installation

```sh
npm i ra-data-duckdb @duckdb/node-api
yarn add ra-data-duckdb @duckdb/node-api
pnpm i ra-data-duckdb @duckdb/node-api
bun add ra-data-duckdb @duckdb/node-api
```

Import `dataProvider` from `ra-data-duckdb` in the browser. Import handlers from `ra-data-duckdb/server` on your backend.

The data provider sends every React Admin operation as an HTTP **POST** to `/{resource}` with a JSON body: `{ method, resource, params }`.

### Frontend

Works with any React setup (Vite, CRA, Next.js client components, etc.):

```tsx
import { Admin, Resource } from "react-admin";
import { dataProvider } from "ra-data-duckdb";

const ReactAdmin = () => (
  <Admin dataProvider={dataProvider("http://localhost:3001")}>
    <Resource name="users" />
  </Admin>
);
```

Point `dataProvider` at your API base URL. React Admin will POST to `http://localhost:3001/users`, `http://localhost:3001/posts`, and so on.

### Backend (Express)

Catch-all route: one `POST /:resource` handler is enough for every resource.

```ts
import { DuckDBInstance } from "@duckdb/node-api";
import cors from "cors";
import express from "express";
import { defaultHandler, fromDuckDBConnection } from "ra-data-duckdb/server";

const instance = await DuckDBInstance.create("data.duckdb");
const connection = await instance.connect();
const db = fromDuckDBConnection(connection);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/:resource", async (req, res) => {
  const result = await defaultHandler(
    { ...req.body, resource: req.params.resource },
    db,
    {
      resourceToTableMap: { users: "app_users" },
      getList: { searchColumns: ["name", "email"] },
    },
  );
  res.json(result);
});

app.listen(3001);
```

Use the same pattern with Fastify, Hono, Koa, or plain `node:http` — wire `defaultHandler` into whatever receives the POST body.

### Backend (Next.js App Router)

Import handlers from `ra-data-duckdb/server` so `react-admin` stays out of server bundles.

```ts
// app/api/[resource]/route.ts
import { DuckDBInstance } from "@duckdb/node-api";
import { defaultHandler, fromDuckDBConnection } from "ra-data-duckdb/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const instance = await DuckDBInstance.create("data.duckdb");
const connection = await instance.connect();
const db = fromDuckDBConnection(connection);

export async function POST(req: Request) {
  const body = await req.json();
  const result = await defaultHandler(body, db, {
    resourceToTableMap: { users: "app_users" },
    getList: { searchColumns: ["name", "email"] },
  });
  return NextResponse.json(result);
}
```

See also: [duckdb-admin example](../../apps/duckdb-admin/).

### Backend (Next.js Pages Router)

```ts
// pages/api/[resource].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { DuckDBInstance } from "@duckdb/node-api";
import { defaultHandler, fromDuckDBConnection } from "ra-data-duckdb/server";

const instance = await DuckDBInstance.create("data.duckdb");
const connection = await instance.connect();
const db = fromDuckDBConnection(connection);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const result = await defaultHandler(req.body, db);
  return res.json(result);
}
```

### Custom executor

Handlers take a minimal `DuckDBExecutor` (`all` / `run`). Use `fromDuckDBConnection` for `@duckdb/node-api`, or supply your own:

```ts
import { defaultHandler, type DuckDBExecutor } from "ra-data-duckdb/server";

const db: DuckDBExecutor = {
  all: async (sql, params) => {
    /* ... */
  },
  run: async (sql, params) => {
    /* ... */
  },
};

await defaultHandler(body, db);
```

### Configuration

Shared options passed to `defaultHandler` (or individual handlers):

| Option | Description |
| --- | --- |
| `resourceToTableMap` | Rename React Admin resource names to table names (not an allowlist; unmapped names still query that identifier) |
| `primaryKey` | Column used as record id (default: `id`) |
| `searchColumns` | Columns searched when filter key `q` is present (`getList` / `getManyReference`) |
| `filterMode` | `"insensitive"` (default for strings), `"default"`, or `undefined` |
| `extraWhere` | Extra SQL `AND` condition on list queries |
| `allowOnlyFields` | Allow-list of writable fields (`create` / `update`) |
| `skipFields` | Fields ignored on update |
| `softDeleteField` | Column set to `CURRENT_TIMESTAMP` instead of hard delete |
| `transform` / `transformRow` / `transformRows` | Shape rows before returning to React Admin |

Example:

```ts
await defaultHandler(body, db, {
  resourceToTableMap: { users: "app_users" },
  getList: {
    searchColumns: ["name", "email"],
    extraWhere: `"active" = true`,
  },
  update: {
    allowOnlyFields: { name: true, email: true },
  },
  delete: {
    softDeleteField: "deleted_at",
  },
});
```

### Handler overrides

Override a single method per resource, or fall back to `defaultHandler`:

```ts
import {
  createHandler,
  defaultHandler,
  getListHandler,
} from "ra-data-duckdb/server";

app.post("/:resource", async (req, res) => {
  const body = { ...req.body, resource: req.params.resource };

  switch (body.method) {
    case "getList":
      return res.json(
        await getListHandler(body, db, {
          searchColumns: ["name", "email"],
        }),
      );
    case "create":
      return res.json(
        await createHandler(body, db, {
          allowOnlyFields: { name: true, email: true },
        }),
      );
    default:
      return res.json(await defaultHandler(body, db));
  }
});
```

### Schema

- Flat tables only — no relation `include` / `connect` (unlike `ra-data-simple-prisma`)
- Default primary key column: `id`
- Resource and column names must match `[A-Za-z_][A-Za-z0-9_]*` (validated and SQL-quoted)

### Filters

Common react-admin filters are mapped to SQL:

| Filter | SQL |
| --- | --- |
| `age: 30` / `age_eq` | `"age" = $p` |
| `age_gte` / `_gt` / `_lte` / `_lt` | comparison |
| `name: "Al"` (string) | `LIKE '%Al%'` (case-insensitive by default) |
| `id_in: [1, 2]` / array value | `IN (...)` |
| `q` + `searchColumns` | OR of LIKE across columns |
| `OR` / `AND` / `NOT` | grouped boolean |

Example list filters:

```tsx
<List filters={[
  <TextInput label="Search" source="q" alwaysOn />,
  <NumberInput label="Min age" source="age_gte" />,
  <TextInput label="Name" source="name" />,
]} />
```

Configure `searchColumns` on the server when using the `q` filter.

### Notes

- **Trusted admin by design.** The sample route has no auth, and `defaultHandler` will CRUD any valid table identifier. `resourceToTableMap` only renames (`users` → `app_users`); a request for an unmapped name still hits that table, including catalog views like `duckdb_tables`. Fine for a locked-down admin dashboard; put your own auth in front if the database should not be fully reachable.
- Identifiers are allowlisted (`[A-Za-z_][A-Za-z0-9_]*`) and quoted; filter and write values are bound as parameters. `allowOnlyFields` is optional — without it, create/update can set any column, and `SELECT *` / `RETURNING *` returns every column. `extraWhere` is raw SQL appended to list queries; keep it a server constant.
- DuckDB is not ideal for high-concurrency multi-writer admin apps; prefer a single writer or an analytics/read-heavy use case.
- Audit logs and Prisma-style relation helpers are not ported — keep v1 flat-table CRUD.
- Compared to [`ra-data-simple-prisma`](../ra-data-simple-prisma/): same HTTP payload shape and handler names, fewer options (no audit, no `include`/`connect`, no bind helpers yet).

### License

MIT
