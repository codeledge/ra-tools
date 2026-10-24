# React Admin + Drizzle ORM

Simple react-admin data provider for [Drizzle ORM](https://orm.drizzle.team/) **v1** on **Postgres**. Same request shape as [`ra-data-simple-prisma`](../ra-data-simple-prisma/): the browser talks HTTP, the server runs Drizzle relational queries.

1. **Browser** — `dataProvider` from `ra-data-drizzle` (POSTs `{ method, resource, params }` to your API)
2. **Server** — `defaultHandler` from `ra-data-drizzle/server` (runs `db.query.*`, `db.insert/update/delete`)

### Requirements

- [react-admin](https://marmelab.com/react-admin/) `>= 5.7.2`
- `drizzle-orm` `>= 1.0.0-rc.4 < 2` — **v1 only**: the adapter is built on Relational Queries v2 (`db.query`). Drizzle v0 / RQB v1 is not supported.
- Postgres (node-postgres, postgres-js, Neon, Supabase, PGlite, ...). MySQL / SQLite are not supported yet.

### Installation

```sh
pnpm i ra-data-drizzle drizzle-orm
```

### Drizzle setup

The handlers find tables through `db.query`, so you must pass `relations` to `drizzle()`. If you have no relations, `defineRelations(schema)` is enough.

```ts
import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  posts: { author: r.one.users({ from: r.posts.authorId, to: r.users.id }) },
  users: { posts: r.many.posts() },
}));

export const db = drizzle(process.env.DATABASE_URL!, { relations });
```

The react-admin resource name is the **key of the table in your schema** (`users`, `posts`, ...). Use `resourceToTableMap` to map other names.

### Frontend

```tsx
import { Admin, Resource } from "react-admin";
import { dataProvider } from "ra-data-drizzle";

const ReactAdmin = () => (
  <Admin dataProvider={dataProvider("/api")}>
    <Resource name="users" />
  </Admin>
);
```

### Backend (Next.js App Router)

```ts
// app/api/[resource]/route.ts
import { defaultHandler } from "ra-data-drizzle/server";
import { db } from "@/db";

export const POST = async (req: Request) => {
  const result = await defaultHandler(await req.json(), db);
  return Response.json(result);
};
```

### Backend (Express)

```ts
app.post("/:resource", async (req, res) => {
  res.json(await defaultHandler({ ...req.body, resource: req.params.resource }, db));
});
```

### Custom handlers

```ts
import { defaultHandler, getListHandler, updateHandler } from "ra-data-drizzle/server";

switch (body.method) {
  case "getList":
    return getListHandler(body, db, {
      columns: { password: false },
      with: { author: { columns: { name: true } } },
      where: { deletedAt: { isNull: true } }, // always ANDed, the client can't loosen it
      noNullsOnSort: ["publishedAt"],
      transformRow: (row) => ({ ...row, url: `/posts/${row.id}` }),
    });
  case "update":
    return updateHandler(body, db, { allowOnlyFields: { title: true, body: true } });
  default:
    return defaultHandler(body, db);
}
```

`bindDefaultHandler({ db, audit })` (and `bindGetListHandler`, ...) pre-bind defaults; pass `{ db: tx }` per call to run inside a transaction.

## Filters

Filter keys use `column@operator`. The operator is **any Drizzle RQB v2 operator, passed through verbatim**:

`eq` `ne` `gt` `gte` `lt` `lte` `in` `notIn` `like` `ilike` `notLike` `notIlike` `isNull` `isNotNull` `arrayContains` `arrayOverlaps` `arrayContained`

```tsx
<NumberInput source="age@gte" />
<TextInput source="title@ilike" />          // you provide the wildcards: "%foo%"
<SelectArrayInput source="status@in" />
<BooleanInput source="deletedAt@isNull" />  // true => isNull, false => isNotNull
```

Aliases for react-admin inputs, which send raw values:

| Filter               | Becomes                                                   |
| -------------------- | --------------------------------------------------------- |
| `title@contains`     | `ilike '%v%'` (`%`, `_` escaped)                          |
| `title@startsWith`   | `ilike 'v%'`                                              |
| `title@endsWith`     | `ilike '%v'`                                              |
| `title@exact`        | `eq v` (`null` => `isNull`)                               |
| `meta@pgjson`        | `meta @> '{...}'::jsonb` (jsonb containment, experimental) |
| `body@search`        | `to_tsvector(body) @@ plainto_tsquery(v)` (experimental)  |

Set `filterMode: "default"` on a handler to use case sensitive `like` instead of `ilike`.

Bare fields (what `<ReferenceInput>`, `<SearchInput>` and default filters send):

| Value                                                   | Becomes          |
| ------------------------------------------------------- | ---------------- |
| string                                                  | `ilike '%v%'`    |
| number, boolean, or `id` / `*Id` / `*_id` / `uuid` key  | `eq`             |
| `null`                                                  | `isNull`         |
| array                                                   | `in`             |
| nested object or dotted key (`author.name@eq`)          | relation filter  |
| `OR` / `AND` (arrays), `NOT` (object)                   | converted recursively |

Empty strings, `undefined`, `_underscored` keys and `q` are ignored. `RAW` and unknown operators are rejected. `@` can never appear in a column name, so snake_case columns like `created_at` or `is_in` are never mistaken for operators.

### Migrating from ra-data-simple-prisma

| ra-data-simple-prisma | ra-data-drizzle        |
| --------------------- | ---------------------- |
| `age_gte`             | `age@gte`              |
| `title_contains`      | `title@contains`       |
| `status_in`           | `status@in`            |
| `tags_has`            | `tags@arrayContains`   |
| `title_equals`, `_eq`, `_exact`, `_enum` | `title@eq` / `title@exact` |
| `x_not`               | `x@ne`                 |
| `x_pgjson`            | `x@pgjson`             |
| `include` / `select` / `omit` | `with` / `columns` |
| `resourceToModelMap`  | `resourceToTableMap`   |
| `connect` / `set` (nested writes) | not supported — Drizzle has no nested writes, write a custom handler |

## Writes

- Only table columns are written: relations or computed fields sent back by react-admin are dropped.
- ISO strings are converted to `Date` for `timestamp`/`date` columns in date mode.
- `create` drops empty strings; `update` never rewrites the primary key.
- `columns` / `with` / `extras` on `create` / `update` re-read the row with the relational API.
- `softDeleteField` on `delete` / `deleteMany` sets the column to `new Date()` instead of deleting.

## Custom primary key

```ts
getListHandler(body, db, { primaryKey: "slug" }); // rows are returned with `id`
createHandler(body, db, { primaryKey: "slug" });  // `id` from react-admin is written to `slug`
```

## Audit log

```ts
export const auditLogs = pgTable("audit_logs", {
  id: serial().primaryKey(),
  action: text().notNull(),
  resource: text().notNull(),
  payload: jsonb().notNull(),
  authorId: text("author_id").notNull(),
  date: timestamp().notNull().defaultNow(),
});

defaultHandler(body, db, {
  audit: {
    table: auditLogs,
    authProvider, // getIdentity().id is stored in `authorId`
    columns: { author: "authorId" }, // column keys, defaults shown in AuditOptions
    enabledForAction: { delete: false },
    enabledResources: ["posts"],
  },
});
```

## Notes

- `getList` / `getManyReference` totals use `db.$count` with the same `where` compiled by Drizzle's own `relationsFilterToSQL`, so relation filters are counted exactly like they are listed.
- Sorting by relation fields (`author.name`) is not supported by RQB v2 object `orderBy` and is ignored; pass a callback `orderBy` in options if you need it.

## Development

```sh
pnpm test   # jest + in-memory PGlite, real SQL
pnpm build
```
