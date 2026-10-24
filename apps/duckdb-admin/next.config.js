const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
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
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // ESM ra-ui-materialui default-imports CJS icon files; without this,
      // webpack treats the CJS module namespace as the component (got: object).
      "@mui/icons-material": path.resolve(
        __dirname,
        "../../node_modules/@mui/icons-material/esm"
      ),
    };
    return config;
  },
};

module.exports = nextConfig;
