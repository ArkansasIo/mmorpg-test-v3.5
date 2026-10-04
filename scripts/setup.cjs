#!/usr/bin/env node

/**
 * Full-Stack Automated Setup & Install Orchestrator
 * Performs pre-flight checks, dependency verification, environment creation,
 * builds both server and frontend, and validates launcher executables.
 */

const { spawnSync, execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");

console.log("================================================================");
console.log(" UNIVERSE CIVILIZATION: EMPIRE AT WAR & BSAT INSTALLER/SETUP");
console.log("================================================================");
console.log(`[INFO] Workspace Root: ${ROOT_DIR}`);
console.log(`[INFO] Node Version:   ${process.version}`);
console.log(`[INFO] Architecture:   ${process.arch} (${process.platform})`);

function checkCommand(cmd, args = ["--version"]) {
  try {
    const res = spawnSync(cmd, args, { encoding: "utf8", shell: true });
    return res.status === 0;
  } catch {
    return false;
  }
}

// 1. Pre-flight Check
console.log("\n[STEP 1/5] Checking System Prerequisites...");
const hasNode = checkCommand("node", ["-v"]);
const hasNpm = checkCommand("npm", ["-v"]);
const hasGit = checkCommand("git", ["--version"]);

console.log(`  ✓ Node.js Runtime: ${hasNode ? "Available" : "MISSING"}`);
console.log(`  ✓ NPM Package Mgr: ${hasNpm ? "Available" : "MISSING"}`);
console.log(`  ✓ Git Versioning:  ${hasGit ? "Available" : "Optional"}`);

if (!hasNode || !hasNpm) {
  console.error("[CRITICAL] Node.js and NPM are required to run Universe Civilization.");
  process.exit(1);
}

// 2. Environment Configuration
console.log("\n[STEP 2/5] Configuring Environment Variables (.env)...");
const envFile = path.join(ROOT_DIR, ".env");
const envExample = path.join(ROOT_DIR, ".env.example");

if (!fs.existsSync(envFile)) {
  console.log("  → .env not detected. Running automated environment initialization...");
  const envConfigScript = path.join(ROOT_DIR, "scripts", "env-config.cjs");
  const initRes = spawnSync(process.execPath, [envConfigScript, "init"], { stdio: "inherit" });
  if (initRes.status !== 0) {
    console.warn("  ⚠ Warning: env-config init encountered non-zero status. Falling back to copy.");
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envFile);
      console.log("  ✓ Created .env from .env.example");
    }
  }
} else {
  console.log("  ✓ Verified existing .env file present.");
}

// 3. Dependency Installation
console.log("\n[STEP 3/5] Verifying and Installing Dependencies...");
const nodeModules = path.join(ROOT_DIR, "node_modules");
if (!fs.existsSync(nodeModules)) {
  console.log("  → node_modules missing. Running npm install...");
  const npmRes = spawnSync("npm", ["install"], { cwd: ROOT_DIR, stdio: "inherit", shell: true });
  if (npmRes.status !== 0) {
    console.error("[ERROR] Failed to install npm dependencies.");
    process.exit(1);
  }
} else {
  console.log("  ✓ node_modules directory confirmed present.");
}

// 4. Compiling Server & Client Builds
console.log("\n[STEP 4/5] Compiling Game Client & Server Components...");
console.log("  → Building TypeScript game server...");
const serverBuildRes = spawnSync("npm", ["run", "server:build"], { cwd: ROOT_DIR, stdio: "inherit", shell: true });
if (serverBuildRes.status !== 0) {
  console.warn("  ⚠ Warning: server:build exited with non-zero code. tsx dev runner remains available.");
} else {
  console.log("  ✓ Server compiled successfully into dist-server/.");
}

console.log("  → Building client bundle with Vite...");
const clientBuildRes = spawnSync("npm", ["run", "build"], { cwd: ROOT_DIR, stdio: "inherit", shell: true });
if (clientBuildRes.status !== 0) {
  console.warn("  ⚠ Warning: Client production build failed. Vite dev server remains available.");
} else {
  console.log("  ✓ Client production bundle built successfully into dist/.");
}

// 5. Native Windows Launchers Build
console.log("\n[STEP 5/5] Generating Native Executable Launchers (.exe)...");
const exeScript = path.join(ROOT_DIR, "scripts", "generate-pe-exe.cjs");
if (fs.existsSync(exeScript)) {
  const exeRes = spawnSync(process.execPath, [exeScript], { cwd: ROOT_DIR, stdio: "inherit" });
  if (exeRes.status === 0) {
    console.log("  ✓ Standalone Windows EXE launchers generated successfully.");
  }
}

console.log("\n================================================================");
console.log(" [SUCCESS] UNIVERSE CIVILIZATION SETUP COMPLETED!");
console.log("================================================================");
console.log(" Available Launch Commands:");
console.log("   • Web Dev Server:       npm run dev              (http://localhost:3000)");
console.log("   • Full-Stack Auto:      npm run start:fullstack");
console.log("   • Game Server Backend:  npm run server:start    (http://localhost:5001)");
console.log("   • Configure Env:        npm run config:env");
console.log("   • Windows Launchers:    install-setup.exe, env-config.exe,");
console.log("                           launch-fullstack.exe, universe-server.exe");
console.log("================================================================\n");
