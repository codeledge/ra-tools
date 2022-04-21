# React Admin & Prisma!

Create a fullstack react admin app adding just one file on the server!

Check the example app to see common usages or use it as a boilerplate.

# Packages

# ra-data-simple-prisma

NPM Package link: https://www.npmjs.com/package/ra-data-simple-prisma

This package does not have a graphql dependency in comparison to (weakky/ra-data-prisma & panter/ra-data-prisma) and

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

## Examples

### demo nextjs app

just do

```bash
cd apps/example-app
pnpm install  //this will also generate the prisma client
pnpm dev
```

### Development

Use the example app to test the changes.

In root folder run

```
pnpm dev
```

this will spin both example app and package in dev mode

#### Common issues

- If there is an error in the backend regarding prisma not finding a table, run `npx prisma generate`

### Publish

Use the example app to test the changes.

In root folder run

```
pnpm publish
```

this will spin both example app and package in dev mode

### TODOs

- [ ] Add all combos in README
- [ ] add next-auth
