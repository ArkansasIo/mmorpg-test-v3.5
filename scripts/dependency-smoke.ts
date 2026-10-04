import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const requiredPackages = [
  "react",
  "react-dom",
  "express",
  "express-session",
  "drizzle-orm",
  "pg",
  "vite",
  "typescript",
  "tsx",
];

for (const packageName of requiredPackages) {
  try {
    require.resolve(packageName);
    console.log(`[dependency-smoke] OK: ${packageName}`);
  } catch (error) {
    console.error(`[dependency-smoke] MISSING: ${packageName}`);
    console.error(error);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[dependency-smoke] All required runtime/build dependencies resolved.");
