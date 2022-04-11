# React Admin & Prisma!

A DataProvider implementation optimised for prisma!

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

## Backend: Pass the request to Prisma

```
import { defaultHandler } from "ra-data-simple-prisma";";
import { prismaClient } from "../prisma/client"; <= Your prisma client instance

export default function handler(req, res) {
    defaultHandler(req, res, prisma);
}
```
