---
"ra-data-simple-prisma": major
---

Security hardening of the server handlers.

- Fix prototype pollution: sort fields, filter keys (including dotted keys) and `getManyReference` targets are now validated identifiers; `__proto__`, `prototype` and `constructor` segments are rejected instead of being written through `deverything.setObjectPath`. Keys inside raw `OR`/`AND`/`NOT` filters are validated too.
- New `resource` option on every handler, `defaultHandler` and the `bind*Handler` defaults. When set, a request whose body names a different resource is rejected, so the client can no longer pick an arbitrary Prisma model. `getModel` also refuses `$`-prefixed client methods and inherited property names.
- `getManyReferenceHandler` combines the reference scope and the request filter with `AND`, so a filter on the target field can no longer replace the scope.
- New `filterableFields` and `sortableFields` options on the list handlers to allow-list filterable/sortable field paths (also enforced inside raw `OR`/`AND`/`NOT`). Sort order must be `asc`/`desc`.
- `RDSPError` is now exported and carries an HTTP `status` (400 for invalid requests, 404 for unknown models).

### Breaking changes

- `getListHandler`, `getInfiniteListHandler` and `getManyReferenceHandler` now require pagination and throw `RDSPError` when it is missing (previously the query was unbounded).
- `extractSkipTake` throws when `page`/`perPage` aren't positive integers or `perPage` is above `maxPerPage` (default 1000, react-admin's export size). Pass `maxPerPage` to the list handlers to change it.
- Invalid sort orders and unsafe field paths throw instead of being passed to Prisma.
- `getManyReferenceHandler` queries `where: { AND: [{ [target]: id }, filter] }` instead of a shallow merge.

### Migration

1. Pass `resource` from your route (URL param or hard-coded per-resource route) to `defaultHandler` / handlers, and check catch-all route resources against an allow-list.
2. If you call list handlers server-side without pagination, add `pagination`; raise `maxPerPage` if you legitimately need pages over 1000 rows.
3. Catch `RDSPError` and respond with `error.status`.
