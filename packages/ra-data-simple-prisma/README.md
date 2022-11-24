# React Admin + Prisma 🤝

Create a fullstack react-admin app adding just one file on the server!

Most of the examples will use Next.js but you can use any node-based server-side framework.

### Installation

```
yarn add ra-data-simple-prisma
```

or

```
npm i ra-data-simple-prisma
```

or

```
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
import { getSession } from "next-auth/react";


export default function handler(req, res) {
  const session = await getSession({ req });
  defaultHandler(req, res, prismaClient, {
    audit: {
      model: prismaClient.audit_log,
      authProvider: authProvider(session)
    },
  });
}
```

audit:

- model: Insert your audit_log table ex. prisma.auditLog
- authProvider: Insert your AuthProvider from React-Admin
- columns?: Link your database tables {id: "id", date: "created_at"}
- enabledForAction?: Enabled for which action ex. {create: true, update: true, delete: false}
  enabledResources?: List of resources which are to be audited. Default all.

### Overrides

All dataProvider methods can be overridden for a given resource, or all.

```js
// /api/post.ts <= override default handler for specific resource

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.body.method) {
    case "create":
      return createHandler<Prisma.PostCreateArgs>(req, res, prismaClient.post, {
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
    case "delete":
      return deleteHandler<Prisma.PostDeleteArgs>(req, res, prismaClient.post, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
    case "deleteMany":
      return deleteManyHandler<Prisma.PostDeleteManyArgs>(req, res, prismaClient.post, {
        softDeleteField: "deletedAt",
        audit: ...
        debug: ...
      });
    case "getList":
      return getListHandler<Prisma.PostFindManyArgs>(
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
    case "getMany":
      return getManyHandler<Prisma.PostFindManyArgs>(
        req,
        res,
        prismaClient.post,
      );
    case "getManyReference":
      return getManyReferenceHandler<Prisma.PostFindManyArgs>(
        req,
        res,
        prismaClient.post,
      );
    case "getOne":
      return getOneHandler<Prisma.PostFindUniqueArgs>(
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
    case "update":
      return updateHandler<Prisma.PostUpdateArgs>(
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
    case "updateMany":
      return updateHandler<Prisma.PostUpdateManyArgs>(
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
    default: // <= fall back on default handler
      return defaultHandler(req, res, prismaClient, {
        audit: ...
        create: ...
        delete: ...
        getList: ...
        getMany: ...
        getManyReference: ...
        getOne: ...
        update: ...
      });
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
