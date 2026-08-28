# DuckDB Admin Example

A minimal Next.js app using React Admin and the workspace's
`ra-data-duckdb` package.

The API creates an in-memory DuckDB database with three users when the server
starts. Changes persist until the development server restarts.

```sh
pnpm --filter duckdb-admin-example dev
```

Open [http://localhost:3030](http://localhost:3030).

Scripts pass `NODE_OPTIONS=--no-webstorage` because Node.js 25+ ships a partial
`localStorage` that breaks Next.js 15.3 SSR.
