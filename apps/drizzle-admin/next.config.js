const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  transpilePackages: [
    "react-admin",
    "ra-core",
    "ra-ui-materialui",
    "ra-i18n-polyglot",
    "ra-language-english",
    "@mui/material",
    "@mui/icons-material",
    "@mui/system",
    "@mui/utils",
  ],
  turbopack: {
    resolveAlias: {
      // ESM ra-ui-materialui default-imports CJS icon files; point at the
      // ESM build so the icons resolve as components, not module namespaces.
      "@mui/icons-material": path.resolve(
        __dirname,
        "../../node_modules/@mui/icons-material/esm",
      ),
    },
  },
};

module.exports = nextConfig;
