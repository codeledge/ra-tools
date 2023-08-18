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

With an audit log

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
      await createHandler<Prisma.PostCreateArgs>(req, prismaClient.post, {
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
      break;
    case "delete":
      await deleteHandler<Prisma.PostDeleteArgs>(req, prismaClient.post, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
      break;
    case "deleteMany":
      await deleteManyHandler<Prisma.PostDeleteManyArgs>(req, prismaClient.post, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
      break;
    case "getList":
      await getListHandler<Prisma.PostFindManyArgs>(
        req,
        prismaClient.post,
        {
          select: ...
          where: ...
          noNullsOnSort: ...
          filterMode: ...
          include: { tags: true },
          // Deprecated - use `map` which works better with TS
          transform: (posts: Post[]) => {
            // some clunky casting to make TS happy
            (posts as AugmentedPost[]).forEach((post ) => {
              post.tagIds = post.tags.map((tag) => tag.id);
            });
          },
          map: (posts: Post[]): AugmentedPost[] => {
            posts.forEach((post) => {
              return {
                ...post
                tagIds: post.tags.map((tag) => tag.id);
              }
            });
          },
        }
      );
      break;
    case "getMany":
      await getManyHandler<Prisma.PostFindManyArgs>(
        req,
        prismaClient.post,
      );
      break;
    case "getManyReference":
      await getManyReferenceHandler<Prisma.PostFindManyArgs>(
        req,
        prismaClient.post,
      );
      break;
    case "getOne":
      await getOneHandler<Prisma.PostFindUniqueArgs>(
        req,
        prismaClient.post,
        {
          select: ...
          include: ...
          transform: (post: any) => {
            post._computedProp = ...
          },
        }
      )
      break;
    case "update":
      await updateHandler<Prisma.PostUpdateArgs>(
        req,
        prismaClient.post,
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
    case "updateMany":
      await updateHandler<Prisma.PostUpdateManyArgs>(
        req,
        prismaClient.post,
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
      await defaultHandler(req, prismaClient, {
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

### Publish

Use the example app to test the changes.

In root folder run

```
pnpm publish
```

### License

MIT
