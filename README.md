# React Admin & Prisma!

This monorepo is formed by the following parts:
Check the demo app to see its usage.

# Packages

# ra-data-simple-prisma

NPM Package link: https://www.npmjs.com/package/ra-data-simple-prisma

This package does not have a graphql dependency in comparison to (weakky/ra-data-prisma & panter/ra-data-prisma)

## React Admin & Prisma!

A DataProvider implementation optimised for prisma!

### Installation

```
yarn add ra-data-simple-prisma
```

or

```
npm i ra-data-simple-prisma
```

### Frontend: use the DataProvider

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

### Backend: Pass the request to Prisma

```
import { defaultHandler } from "ra-data-simple-prisma";";
import { prismaClient } from "../prisma/client"; <= Your prisma client instance

export default function handler(req, res) {
    defaultHandler(req, res, prisma);
}
```

## Examples

### demo nextjs app: ra-nextjs-prisma-example

just do

```bash
cd apps/ra-nextjs-prisma-example/
pnpm install
npx prisma generate
pnpm dev
```

### TODOs

- [ ] Better README
- [ ] All handlers
- [ ] add next-auth
