# React Admin + Prisma 🤝

Create a fullstack react-admin app adding just one file on the server!

Most of the examples will use Next.js but you can use any node-based server-side framework.

### Installation

```
npm i ra-data-simple-prisma
yarn add ra-data-simple-prisma
pnpm i ra-data-simple-prisma
```

### Frontend: import the DataProvider

```js
import { Admin, Resource } from "react-admin";
import { dataProvider } from "ra-data-simple-prisma";

const ReactAdmin = () => {
  return (
    <Admin dataProvider={dataProvider("/api", options)}>
      <Resource name="users" />
    </Admin>
  );
};

export default ReactAdmin;
```

### Backend: import the request handlers

Server-side code should import from the `/server` subpath. This entry
contains only the request handlers and helpers, with no dependency on
`react-admin` (and therefore no transitive dependency on `ra-core`,
`ra-ui-materialui`, or `react-router-dom`). This keeps Next.js / Vercel
serverless bundles small and avoids ESM resolution issues caused by
tracing UI-only packages into the function.

```js
// -- Example for Next Pages router --
// /api/[resource].ts <= catch all resource requests

import { defaultHandler } from "ra-data-simple-prisma/server";
import { prismaClient } from "../prisma/client"; // <= Your prisma client instance

// Only expose the resources the admin actually needs.
const ADMIN_RESOURCES = new Set(["post", "tag", "comment"]);

export default async function handler(req, res) {
  const resource = String(req.query.resource);
  if (!ADMIN_RESOURCES.has(resource)) return res.status(404).end();

  // `resource` binds the handler to the route: a body naming another
  // resource is rejected instead of being used to pick the Prisma model.
  const result = await defaultHandler(req.body, prismaClient, { resource });
  res.json(result);
}

// -- Example for Next App router --
// /app/api/[resource]/route.ts <= catch all resource requests

import { defaultHandler } from "ra-data-simple-prisma/server";
import { prismaClient } from "../prisma/client"; // <= Your prisma client instance
import { NextResponse } from "next/server";

const ADMIN_RESOURCES = new Set(["post", "tag", "comment"]);

const handler = async (
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) => {
  const { resource } = await params;
  if (!ADMIN_RESOURCES.has(resource)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const result = await defaultHandler(body, prismaClient, { resource });
  return NextResponse.json(result);
};

export { handler as GET, handler as POST };
```

> The top-level `ra-data-simple-prisma` import still re-exports the
> handlers for backwards compatibility, but new server-side code should
> prefer `ra-data-simple-prisma/server` so that `react-admin` stays out
> of the server bundle.

### Remix

The data provider sends all React Admin operations as `POST` requests, so use a
Remix resource route `action` to read the JSON payload. For example, in a
catch-all route such as `app/routes/api.$.tsx`:

```tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { defaultHandler, type RaPayload } from "ra-data-simple-prisma/server";
import { prisma } from "../your/prisma/client";

const ADMIN_RESOURCES = new Set(["post", "tag", "comment"]);

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const resource = params["*"] ?? "";
  if (!ADMIN_RESOURCES.has(resource)) throw new Response(null, { status: 404 });

  const body = (await request.json()) as RaPayload;
  const result = await defaultHandler(body, prisma, { resource });

  return json(result);
};
```

If the route also needs to support `GET` requests from other clients, export a
separate `loader` and parse its input from the URL rather than calling
`request.json()`.

### Security

The request body is fully client-controlled. These options keep the server in charge:

- **Bind each route to its resource.** Pass `resource` (to `defaultHandler`, any handler, or a `bind*Handler`). The body's `resource` must then match, otherwise an `RDSPError` is thrown. Without it, the body decides which Prisma model is queried, so a request sent to `/api/post` could read `user`. In catch-all routes, check the URL resource against your own allow-list first.
- **Pagination is required for list queries.** `getListHandler`, `getInfiniteListHandler` and `getManyReferenceHandler` reject requests without pagination, with non-positive or non-integer `page`/`perPage`, or with `perPage` above `maxPerPage` (default `1000`, react-admin's export size). Lower it per handler with `maxPerPage`.
- **Restrict filters and sorts.** By default any model field can be filtered and sorted, including fields hidden with `omit`/`select` (e.g. `password_hash_startsWith`). Pass `filterableFields` and `sortableFields` to the list handlers to allow only the listed field paths; this also applies to fields inside raw `OR`/`AND`/`NOT` filters. Remember to include the default sort field (usually `id`).
- **Path safety.** Sort fields, filter keys and reference targets must be plain identifiers; `__proto__`, `prototype` and `constructor` segments are rejected.

```ts
await getListHandler<Prisma.UserFindManyArgs>(req.body, prismaClient, {
  resource: "user",
  omit: { password_hash: true },
  filterableFields: ["email", "role", "organization.name"],
  sortableFields: ["id", "email", "createdAt"],
  maxPerPage: 200,
});
```

Validation failures throw `RDSPError`, which has a `status` (400 for invalid input, 404 for unknown models). Map it to your HTTP response:

```ts
import { RDSPError } from "ra-data-simple-prisma/server";

try {
  return NextResponse.json(await defaultHandler(body, prismaClient, { resource }));
} catch (error) {
  if (error instanceof RDSPError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  throw error;
}
```

### Bind shared defaults

Lazy?
Each handler has its own bind function, so you don't have to pass the same options on every call. Call-site options override the bound defaults. Write binders accept a default `audit` object.

```ts
import {
  bindCreateHandler,
  bindGetListHandler,
  bindUpdateHandler,
} from "ra-data-simple-prisma/server";
import { prismaRead, prismaWrite } from "../prisma/client";

const resourceToModelMap = {
  admin: "adminUser",
  users: "user",
};

export const createHandler = bindCreateHandler({
  prismaClient: prismaWrite,
  resourceToModelMap,
  audit: { model: prismaWrite.audit_log },
});

export const updateHandler = bindUpdateHandler({
  prismaClient: prismaWrite,
  resourceToModelMap,
  audit: { model: prismaWrite.audit_log },
});

export const getListHandler = bindGetListHandler({
  prismaClient: prismaRead,
  resourceToModelMap,
});

await getListHandler(req.body, { include: { posts: true } });

await createHandler(req.body, {
  audit: { authProvider },
});

await getListHandler(req.body, {
  prismaClient: debugPrismaClient,
});
```


### (List) Filters: Available Operators

To be used with an underscore after the `source` name

- contains: prisma native operator (Default for string)
- endsWith: prisma native operator
- enum: to be used with enums, where exact match is required
- eq: equals
- exact: equals
- gt: prisma native operator
- gte: prisma native operator
- has: prisma native operator
- lt: prisma native operator
- lte: prisma native operator
- not: prisma native operator
- search: prisma native operator
- startsWith: prisma native operator
- pgjson: if using postgres drill down the json field

Example

```ts
<List
    {...props}
    filters={[
      <SelectInput
        label="Status"
        source={"status_enum"}
      />,
      <DateInput
        label="Created After or on"
        source={"created_at_gte"}
      />,
      <TextInput
        label="Full-text Body search"
        source={"body_search"}
      />,
      <TextInput
        label="User's language"
        source={"user.settings.language_enum"} // <= drill down in relationships
      />,
      <TextInput
        label="Metadata's subkey"
        source={"metadata_pgjson.key.subkey"}
      />,
    ]}
  >
```

### Prisma Logical Operators Support

- AND
- OR
- NOT

Enabling complex filtering capabilities in React Admin applications.

Previously, `ra-data-simple-prisma` did not support Prisma's logical operators, limiting users to simple field-based filtering. Complex queries requiring logical combinations of conditions were not possible. We can use it on navigation for example

```ts
const OR = [
  { amount: { gte: 1000 }, status: "ACTIVE" },
  { amount: { lt: 500 }, status: "REJECTED" },
];

navigate(`/resource_name?filter=${JSON.stringify({ OR })}`);
```

### With audit log

```js
export default function handler(req) {
  const session = await getServerSession(...);
  await defaultHandler(req.body, prismaClient, {
    audit: {
      model: prismaClient.audit_log,
      authProvider: authProvider(session)
    },
  });
  ...
}
```

audit:

- model: The prisma model of the `audit log` table eg. `prisma.auditLog`
- authProvider: Insert your AuthProvider from React-Admin
- columns?: Map fields to your database columns `{id: "_id", date: "created_at"}`
- enabledForAction?: Enabled for which action eg. `{create: true, update: true, delete: false}`
- enabledResources?: List of resources which are to be audited. Defaults to all.

The `payload` column stores a `AuditLogPayload` object:

```ts
type AuditLogPayload = {
  id: Identifier; // record id
  data?: object; // the new values sent by react-admin (present on create / update)
  previousData?: object; // the record values before the change (present on update)
};
```

- `data` is populated from `request.params.data` — i.e. the fields the user submitted in the create/update form.
- `previousData` is populated from `request.params.previousData` — i.e. the full record as it existed before the update. React-Admin sends this automatically when editing a record.
- Neither field is present on `delete` actions (only `id` is stored).

### Overrides

All dataProvider methods can be overridden for a given resource, or all.

```js
// /api/post.ts <= override default handler for specific resource

export default function handler(req) {
  switch (req.body.method) {
    case "create":
      await createHandler<Prisma.PostCreateArgs>(req.body, prismaClient, {
        allowOnlyFields: {
          title: true,
          body: true,
          tagIds: true,
        },
        connect: {
          tags: "id",
          // or
          tagIds: {
            tag: "id",
          },
          // or
          mediaIds: {
            postToMediaRels: {
              media: "id",
            }
          },
        },
        audit: ...
        debug: ...
      });
      return NextResponse.json(...);
    case "delete":
      await deleteHandler<Prisma.PostDeleteArgs>(req.body, prismaClient, {
        softDeleteField: "deletedAt",
        primaryKey: ... // defaults to "id"
        audit: ...
        debug: ...
      });
      break;
    case "deleteMany":
      await deleteManyHandler<Prisma.PostDeleteManyArgs>(req.body, prismaClient, {
        softDeleteField: "deletedAt",
        primaryKey: ... // defaults to "id"
        audit: ...
        debug: ...
      });
      break;
    case "getList":
      await getListHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
        {
          primaryKey: ... // defaults to "id"
          select: ...
          where: ...
          noNullsOnSort: ...
          filterMode: ...
          debug: ...
          include: { tags: true },
          transformRow: (post: ServerPost, postIndex: number, posts: ServerPost[]): AugmentedPost => {
            return {
                ...post
                tagIds: post.tags.map((tag) => tag.id);
              }
          },
          transformRows: async (posts: ServerPost[]): Promise<AugmentedPost[]> => {
            const stats = await fetchStatsForPosts(posts.map((post) => post.id));
            return posts.map((post) => ({ ...post, stats: stats[post.id] }));
          },
        }
      );
      // OR, if using InfiniteList component
      await getInfiniteListHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
        {
          primaryKey: ... // defaults to "id"
          select: ...
          where: ...
          noNullsOnSort: ...
          filterMode: ...
          debug: ...
          include: { tags: true },
          transformRow: (post: ServerPost, postIndex: number, posts: ServerPost[]): AugmentedPost => {
            return {
                ...post
                tagIds: post.tags.map((tag) => tag.id);
              }
          },
          transformRows: ... // same as getListHandler
        }
      );
      break;
    case "getMany":
      await getManyHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
        {
          primaryKey: ... // defaults to "id"
          transformRow: ... // same as getListHandler
          transformRows: ... // same as getListHandler
        }
      );
      break;
    case "getManyReference":
      await getManyReferenceHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
        {
          primaryKey: ... // defaults to "id"
          transformRow: ... // same as getListHandler
          transformRows: ... // same as getListHandler
        }
      );
      break;
    case "getOne":
      await getOneHandler<Prisma.PostFindUniqueArgs>(
        req.body,
        prismaClient,
        {
          primaryKey: ... // defaults to "id"
          select: ...
          include: ...
          transform: (post: any) => {
            post._computedProp = ...
          },
          transform: async (
            post: QueryPost
          ): Promise<QueryPost & { _extraPropAfterTransform: true }> => {
            return {
              ...post,
              _extraPropAfterTransform: await Promise.resolve(true),
            };
          },
        }
      )
      break;
    case "update":
      await updateHandler<Prisma.PostUpdateArgs>(
        req.body,
        prismaClient,
        {
          primaryKey: ... // defaults to "id", also used by updateMany
          allowOnlyFields: {
            title: true,
            body: true,
            tagIds: true,
          },
          skipFields: {
            computedField: true
          },
          set: {
            tags: "id",
          },
          allowNestedUpdate: {
            user_settings: true,
            fixed_settings: false,
          },
          allowNestedUpsert: {
            other_settings: true
          },
          allowJsonUpdate: {
            raw_data_field: true;
          }
        }
      );
      break;
    case "updateMany":
      await updateManyHandler<Prisma.PostUpdateManyArgs>(
        req.body,
        prismaClient,
        {
          skipFields: {
            computedField: true
          },
          set: {
            tags: "id",
          },
        }
      );
      break;
    default: // <= fall back on default handler
      await defaultHandler(req.body, prismaClient, {
        audit: ...
        create: ...
        delete: ...
        getList: ...
        getMany: ...
        getManyReference: ...
        getOne: ...
        update: ...
      });
      break;
  }
}
```

### Custom Primary Key

By default all handlers use `id` as the primary key field, matching the react-admin data connector convention. If your Prisma model uses a different primary key name (e.g. `Id`, `StatusId`, `postId`) you can configure it per-handler via the `primaryKey` option.

This affects:

- how the `WHERE` clause is built for single-record lookups and multi-record `{ in: ids }` filters
- how incoming write payloads are handled and returned records are normalized for react-admin compatibility

```ts
// /api/status.ts — model with a non-standard primary key "StatusId"

case "getOne":
  return getOneHandler(req.body, prismaClient, {
    primaryKey: "StatusId",
  });

case "getMany":
  return getManyHandler(req.body, prismaClient, {
    primaryKey: "StatusId",
  });
...
```

### Allow Only Fields

Both `createHandler` and `updateHandler` support an `allowOnlyFields` option that acts as an explicit allow-list of fields that may be written.

```ts
// create
await createHandler(req.body, prismaClient, {
  allowOnlyFields: {
    title: true,
    body: true,
    tagIds: true,
  },
});

// update
await updateHandler(req.body, prismaClient, {
  allowOnlyFields: {
    title: true,
    body: true,
    tagIds: true,
  },
});
```

> **Note:** Fields with an empty string value (`""`) and internal `_`-prefixed fields (e.g. `_count`) are stripped automatically before the allow-list is checked, so they will never trigger an error.

### Omit Fields

The `omit` option is supported by `getListHandler`, `getOneHandler`, `getManyHandler`, `getManyReferenceHandler`, `createHandler`, and `updateHandler`. It maps directly to [Prisma's `omit` clause](https://www.prisma.io/docs/orm/prisma-client/queries/select-fields#omitting-fields), letting you exclude specific fields from query results without having to enumerate all the fields you _do_ want (as you would with `select`).

This is useful for stripping sensitive fields (e.g. `password`, `secret`) or large fields you never need in the admin UI.

```ts
// Exclude the password hash from every user record returned
await getListHandler<Prisma.UserFindManyArgs>(req.body, prismaClient, {
  omit: {
    password_hash: true,
  },
});

await getOneHandler<Prisma.UserFindUniqueArgs>(req.body, prismaClient, {
  omit: {
    password_hash: true,
  },
});

await getManyHandler<Prisma.UserFindManyArgs>(req.body, prismaClient, {
  omit: {
    password_hash: true,
  },
});

await getManyReferenceHandler<Prisma.UserFindManyArgs>(req.body, prismaClient, {
  omit: {
    password_hash: true,
  },
});

// Also available on write handlers — omits fields from the returned record
await createHandler<Prisma.UserCreateArgs>(req.body, prismaClient, {
  omit: {
    password_hash: true,
  },
});

await updateHandler<Prisma.UserUpdateArgs>(req.body, prismaClient, {
  omit: {
    password_hash: true,
  },
});
```

> **Note:** `omit` and `select` are mutually exclusive in Prisma — passing both will cause a runtime error.

> **Note:** `omit` only removes fields from the response. Omitted fields can still be filtered and sorted on unless you set `filterableFields` / `sortableFields` (see [Security](#security)).

### Helpers

Stuff you can use to write your own custom logic

- extractOrderBy
- extractSkipTake
- extractWhere

### Permissions

In your Api handler, call the function `canAccess` to infer if the user (session) can perform that particular action.
Example in [admin demo](apps/admin/auth/checkAccess.ts)

It will need the permission object which looks like this

```
export const permissionsConfig: PermissionsConfig = {
  OWNER: [{ action: "*", resource: "*" }], //admin can do anything
  COLLABORATOR: [
    //collaborator can do anything except edit, delete, create admin users
    { action: "*", resource: "*" },
    {
      type: "deny",
      action: ["edit", "delete", "create"],
      resource: "adminUser",
    },
  ],
  READER: [{ action: ["list", "show", "export"], resource: "*" }],
};
```

### Publish

Use the example app to test the changes.

In root folder run

```
pnpm publish
```

### License

MIT
