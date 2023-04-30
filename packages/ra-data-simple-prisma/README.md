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
    <Admin dataProvider={dataProvider("/api")}>
      <Resource name="users" />
    </Admin>
  );
};

export default ReactAdmin;
```

### Backend: import the request handlers

Simplest implementation ever:

```js
// /api/[resource].ts <= catch all resource requests

import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "../prisma/client"; // <= Your prisma client instance

export default function handler(req, res) {
  defaultHandler(req, res, prismaClient);
}
```

With an audit log (ex. uses next-auth):

```js
// /api/[resource].ts <= catch all resource requests

import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "../prisma/client";
import { authProvider } from "../providers/authProvider";
import { getServerSession } from "next-auth/next";

export default function handler(req, res) {
  const session = await getServerSession(req);
  await defaultHandler(req, res, prismaClient, {
    audit: {
      model: prismaClient.audit_log,
      authProvider: authProvider(session)
    },
  });
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.body.method) {
    case "create":
      await createHandler<Prisma.PostCreateArgs>(req, res, prismaClient.post, {
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
      await deleteHandler<Prisma.PostDeleteArgs>(req, res, prismaClient.post, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
      break;
    case "deleteMany":
      await deleteManyHandler<Prisma.PostDeleteManyArgs>(req, res, prismaClient.post, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
      break;
    case "getList":
      await getListHandler<Prisma.PostFindManyArgs>(
        req,
        res,
        prismaClient.post,
        {
          select: ...
          where: ...
          noNullsOnSort: ...
          filterMode: ...
          include: { tags: true },
          transform: (posts: any[]) => {
            posts.forEach((post: any) => {
              post.tags = post.tags.map((tag: any) => tag.id);
            });
          },
        }
      );
      break;
    case "getMany":
      await getManyHandler<Prisma.PostFindManyArgs>(
        req,
        res,
        prismaClient.post,
      );
      break;
    case "getManyReference":
      await getManyReferenceHandler<Prisma.PostFindManyArgs>(
        req,
        res,
        prismaClient.post,
      );
      break;
    case "getOne":
      await getOneHandler<Prisma.PostFindUniqueArgs>(
        req,
        res,
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
        res,
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
        res,
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
      await defaultHandler(req, res, prismaClient, {
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
