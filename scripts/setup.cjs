#!/usr/bin/env node

/**
 * Full-Stack Automated Setup & Install Orchestrator.
 * Fails closed when required project files or production builds are missing.
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

console.log("================================================================");
console.log(" UNIVERSE CIVILIZATION: EMPIRE AT WAR & BSAT INSTALLER/SETUP");
console.log("================================================================");
console.log(`[INFO] Workspace Root: ${ROOT_DIR}`);
console.log(`[INFO] Node Version:   ${process.version}`);
console.log(`[INFO] Architecture:   ${process.arch} (${process.platform})`);

function run(command, args, label) {
  console.log(`[RUN] ${label}`);
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: "inherit",
    windowsHide: false,
    shell: false,
  });
  if (result.error) {
    console.error(`[ERROR] ${label}: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

function requireFile(relativePath) {
  const absolutePath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`[ERROR] Required project file is missing: ${relativePath}`);
    console.error("[ERROR] This local checkout is incomplete or out of date.");
    return false;
  }
  return true;
}

const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "tsconfig.server.json",
  "vite.config.ts",
  "src/App.tsx",
  "src/main.tsx",
  "src/cronData.ts",
  "src/ogameData.ts",
  "src/adminData.ts",
  "src/data/ogameAdminData.ts",
  "server/index.ts",
];

console.log("\n[STEP 1/5] Checking System Prerequisites...");
if (run(process.execPath, ["-v"], "Node.js runtime") !== 0) process.exit(1);
if (run(npmCommand, ["-v"], "NPM package manager") !== 0) process.exit(1);

const majorNode = Number(process.versions.node.split(".")[0]);
if (majorNode < 20 || majorNode > 24) {
  console.warn(`[WARN] Node.js ${process.version} is outside the supported 20-24 range.`);
  console.warn("[WARN] Node.js 22 LTS is the recommended development/CI version.");
}

console.log("\n[STEP 2/5] Validating Project Files...");
if (!requiredFiles.every(requireFile)) process.exit(1);

console.log("\n[STEP 3/5] Configuring Environment Variables (.env)...");
const envFile = path.join(ROOT_DIR, ".env");
const envExample = path.join(ROOT_DIR, ".env.example");
if (!fs.existsSync(envFile)) {
  const envConfigScript = path.join(ROOT_DIR, "scripts", "env-config.cjs");
  const initStatus = run(process.execPath, [envConfigScript, "init"], "environment initialization");
  if (initStatus !== 0 && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log("  ✓ Created .env from .env.example");
  }
} else {
  console.log("  ✓ Verified existing .env file present.");
}

console.log("\n[STEP 4/5] Verifying Dependencies and Production Builds...");
if (!fs.existsSync(path.join(ROOT_DIR, "node_modules"))) {
  if (run(npmCommand, ["install", "--no-audit", "--no-fund"], "dependency installation") !== 0) {
    process.exit(1);
  }
} else {
  console.log("  ✓ node_modules directory confirmed present.");
}

if (run(npmCommand, ["run", "server:build"], "TypeScript game server build") !== 0) {
  console.error("[ERROR] Server build failed.");
  process.exit(1);
}
if (run(npmCommand, ["run", "build"], "Vite client production build") !== 0) {
  console.error("[ERROR] Client production build failed.");
  process.exit(1);
}
if (run(npmCommand, ["run", "typecheck"], "TypeScript typecheck") !== 0) {
  console.error("[ERROR] TypeScript typecheck failed.");
  process.exit(1);
}

console.log("\n[STEP 5/5] Generating Native Windows Launchers...");
const exeScript = path.join(ROOT_DIR, "scripts", "generate-pe-exe.cjs");
if (fs.existsSync(exeScript) && run(process.execPath, [exeScript], "Windows launcher generation") !== 0) {
  console.error("[ERROR] Launcher generation failed.");
  process.exit(1);
}

console.log("\n================================================================");
console.log(" [SUCCESS] UNIVERSE CIVILIZATION SETUP COMPLETED!");
console.log("================================================================");
console.log(" The server, client production build, and TypeScript checks all passed.");
console.log("================================================================\n");
process.exit(0);
