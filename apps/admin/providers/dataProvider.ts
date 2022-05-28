import { DataProvider } from "react-admin";
import { dataProvider as prismaDataProvider } from "ra-data-simple-prisma";

export const dataProvider: DataProvider = prismaDataProvider("/api", {
  resourceToModelMap: {
    admin: "adminUser",
  },
});
