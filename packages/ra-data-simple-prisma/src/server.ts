// Server-only entry point.
// This module intentionally excludes any code that depends on `react-admin`
// (notably the `dataProvider` and `HttpError`) so that Next.js / Vercel
// serverless functions importing handlers do not transitively pull in
// `react-admin`, `ra-core`, `ra-ui-materialui`, or `react-router-dom`.
//
// Use `ra-data-simple-prisma/server` from server-side code, and the
// top-level `ra-data-simple-prisma` import from client-side code.

export * from "./audit";
export * from "./createHandler";
export * from "./defaultHandler";
export * from "./deleteHandler";
export * from "./deleteManyHandler";
export * from "./extractOrderBy";
export * from "./extractSkipTake";
export * from "./extractWhere";
export * from "./getInfiniteListHandler";
export * from "./getListHandler";
export * from "./getManyHandler";
export * from "./getManyReferenceHandler";
export * from "./getOneHandler";
export * from "./hasFieldChanged";
export * from "./Http";
export * from "./isExport";
export * from "./permissions";
export * from "./updateHandler";
export * from "./updateManyHandler";
