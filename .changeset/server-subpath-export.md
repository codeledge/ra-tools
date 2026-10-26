---
"ra-data-simple-prisma": minor
---

Add `ra-data-simple-prisma/server` subpath export for server-side use.

The server entry contains only the Prisma request handlers and helpers
and has no dependency on `react-admin` (and therefore no transitive
dependency on `ra-core`, `ra-ui-materialui`, or `react-router-dom`).
Importing from this subpath inside Next.js / Vercel serverless functions
avoids tracing UI-only packages into the function bundle and fixes ESM
resolution failures caused by `react-router-dom@7.x`'s `exports` field.

The top-level `ra-data-simple-prisma` import is unchanged and still
re-exports both the client-side `dataProvider` and the server-side
handlers, so this is a non-breaking change. `react-admin` is now marked
as an optional peer dependency for server-only consumers.
