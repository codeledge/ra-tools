# React Admin & Prisma!

Create a fullstack react admin app adding just one file on the server!

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

```
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

```
// /api/[resource].ts

import { defaultHandler } from "ra-data-simple-prisma";";
import { prismaClient } from "../prisma/client"; <= Your prisma client instance

export default function handler(req, res) {
    defaultHandler(req, res, prisma);
}
```

### Publish

Use the example app to test the changes.

In root folder run

```
pnpm publish
```
