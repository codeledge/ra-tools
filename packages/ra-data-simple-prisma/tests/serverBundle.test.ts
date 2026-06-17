import { describe, expect, test } from "@jest/globals";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const distDir = join(__dirname, "..", "dist");

// These tests only run if `pnpm build` has been executed beforehand.
// They guard against a regression in which the server-only entry
// transitively imports `react-admin`, which would pull react-admin (and
// its transitive deps) into Next.js / Vercel serverless bundles that
// only need the Prisma-side handlers.
const maybeDescribe = existsSync(join(distDir, "server.js")) ? describe : describe.skip;

maybeDescribe("dist/server bundle", () => {
  test("CJS server bundle does not reference react-admin", () => {
    const contents = readFileSync(join(distDir, "server.js"), "utf8");
    expect(contents).not.toMatch(/['"]react-admin['"]/);
  });

  test("ESM server bundle does not reference react-admin", () => {
    const contents = readFileSync(join(distDir, "server.mjs"), "utf8");
    expect(contents).not.toMatch(/['"]react-admin['"]/);
  });
});
