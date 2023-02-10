# React Admin & Prisma (& Next.js)

Check the example apps to see common usages or use them as a boilerplate.

# Packages

[ra-data-simple-prisma](./packages/ra-data-simple-prisma/)
[next-auth-prisma](./packages/next-auth-prisma/)

# Examples

[example admin app](./apps/admin/) Debug, test, and develop the packages, but also use it as the admin/CMS for the website!
[example website](./apps/website/) A nextjs/mui boilerplate to show the data (very much under construction yet)

### Development

Use the example app to test the changes.

In root folder run

```
pnpm dev
```

this will spin both the apps and package in dev mode!

#### Common issues

- If there is an error in the backend regarding prisma not finding a table, run `npx prisma generate`

### TODOs

- [ ] Add all combos in README
- [ ] create an amazing website showing all the data
