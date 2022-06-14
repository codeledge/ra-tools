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
  defaultHandler(req, res, prisma);
}
```

### Overrides

All dataProvider methods can be overridden for a given resource, or all.

```js
// /api/post.ts <= override default handler for specific resource

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.body.method) {
    case "create":
      return createHandler(req, res, prismaClient.post, {
        connect: {
          tags: "id",
        },
      });
    case "delete":
      return deleteHandler(req, res, prismaClient.post, {
        softDeleteField: "deletedAt",
      });
    case "deleteMany":
      return deleteManyHandler(req, res, prismaClient.post, {
        softDeleteField: "deletedAt",
      });
    case "getList":
      return getListHandler(
        req,
        res,
        prismaClient.post,
        {
          select: ...
          include: { tags: true },
          transform: (posts: any[]) => {
            posts.forEach((post: any) => {
              post.tags = post.tags.map((tag: any) => tag.id);
            });
          },
        }
      );
    case "getMany":
      return getManyHandler(
        req,
        res,
        prismaClient.post,
      );
    case "getManyReference":
      return getManyReferenceHandler(
        req,
        res,
        prismaClient.post,
      );
    case "getOne":
      return getOneHandler(
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
      return updateHandler(
        req,
        res,
        prismaClient.post,
        {
          skipFields: ...
          allowFields: ...
          set: {
            tags: "id",
          },
        }
      );
    default: // <= fall back on default handler
      return defaultHandler(req, res, prismaClient);
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
