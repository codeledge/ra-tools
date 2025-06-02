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

Simplest implementation ever:

```js
// -- Example for Next Pages router --
// /api/[resource].ts <= catch all resource requests

import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "../prisma/client"; // <= Your prisma client instance

export default async function handler(req, res) {
  const result = await defaultHandler(req.body, prismaClient);
  res.json(result);
}

// -- Example for Next App router --
// /app/api/[resource]/route.ts <= catch all resource requests

import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "../prisma/client"; // <= Your prisma client instance
import { NextResponse } from "next/server";

const handler = async (req: Request) => {
  const body = await req.json();
  const result = await defaultHandler(body, prismaClient);
  return NextResponse.json(result);
};

export { handler as GET, handler as POST };
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

### Overrides

All dataProvider methods can be overridden for a given resource, or all.

```js
// /api/post.ts <= override default handler for specific resource

export default function handler(req) {
  switch (req.body.method) {
    case "create":
      await createHandler<Prisma.PostCreateArgs>(req.body, prismaClient, {
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
        audit: ...
        debug: ...
      });
      break;
    case "deleteMany":
      await deleteManyHandler<Prisma.PostDeleteManyArgs>(req.body, prismaClient, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
      break;
    case "getList":
      await getListHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
        {
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
        }
      );
      // OR, if using InfiniteList compoenent
      await getInfiniteListHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
        {
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
        }
      );
      break;
    case "getMany":
      await getManyHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
      );
      break;
    case "getManyReference":
      await getManyReferenceHandler<Prisma.PostFindManyArgs>(
        req.body,
        prismaClient,
      );
      break;
    case "getOne":
      await getOneHandler<Prisma.PostFindUniqueArgs>(
        req.body,
        prismaClient,
        {
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
