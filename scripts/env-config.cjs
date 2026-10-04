#!/usr/bin/env node

/**
 * Universal Environment Variable & Config System for Universe Civilization & BSAT
 * Handles interactive configuration, validation, generation of .env, and preset loading.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const readline = require("node:readline");

const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT_DIR, ".env");
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, ".env.example");

// Schema of supported variables
const CONFIG_SCHEMA = [
  {
    key: "PORT",
    label: "Backend Server Port",
    category: "Server",
    defaultValue: "5001",
    description: "HTTP port for the Express game backend API",
  },
  {
    key: "NODE_ENV",
    label: "Node Environment",
    category: "Server",
    defaultValue: "development",
    description: "Runtime mode ('development', 'production', 'test')",
  },
  {
    key: "SESSION_SECRET",
    label: "Session Secret Key",
    category: "Security",
    defaultValue: () => crypto.randomBytes(32).toString("hex"),
    description: "High-entropy secret for signing session cookies",
  },
  {
    key: "DATABASE_URL",
    label: "PostgreSQL Database URL",
    category: "Database",
    defaultValue: "",
    description: "Postgres connection URI (leave default for mock/offline fallback)",
  },
  {
    key: "CORS_ORIGINS",
    label: "CORS Allowed Origins",
    category: "Network",
    defaultValue: "http://localhost:3000,http://127.0.0.1:3000",
    description: "Comma-separated list of web origins allowed for API credentials",
  },
  {
    key: "APP_URL",
    label: "Client App URL",
    category: "Network",
    defaultValue: "http://localhost:3000",
    description: "Canonical web frontend address",
  },
  {
    key: "DB_POOL_MAX",
    label: "Database Connection Pool Max",
    category: "Database",
    defaultValue: "10",
    description: "Maximum simultaneous connections in PostgreSQL pool",
  },
  {
    key: "DB_IDLE_TIMEOUT_MS",
    label: "DB Idle Timeout (ms)",
    category: "Database",
    defaultValue: "30000",
    description: "Time before idle database client is closed",
  },
  {
    key: "VITE_PORT",
    label: "Frontend Dev Server Port",
    category: "Frontend",
    defaultValue: "3000",
    description: "Vite client interface port",
  },
  {
    key: "VITE_FIREBASE_API_KEY",
    label: "Firebase Client API Key",
    category: "Frontend",
    defaultValue: "demo-api-key",
    description: "Optional Firebase Web API key for authentication",
  },
  {
    key: "VITE_FIREBASE_AUTH_DOMAIN",
    label: "Firebase Auth Domain",
    category: "Frontend",
    defaultValue: "localhost",
    description: "Optional Firebase domain for OAuth callbacks",
  },
  {
    key: "VITE_FIREBASE_PROJECT_ID",
    label: "Firebase Project ID",
    category: "Frontend",
    defaultValue: "local-demo",
    description: "Optional Firebase project identifier",
  },
  {
    key: "ADMIN_BOOTSTRAP_USERNAME",
    label: "Super Admin Username",
    category: "Admin",
    defaultValue: "",
    description: "Master administrative user name",
  },
  {
    key: "ADMIN_BOOTSTRAP_EMAIL",
    label: "Super Admin Email",
    category: "Admin",
    defaultValue: "",
    description: "Master administrative account email",
  },
  {
    key: "ADMIN_BOOTSTRAP_PASSWORD",
    label: "Super Admin Password",
    category: "Admin",
    defaultValue: "",
    description: "Master administrative initial password",
  },
  {
    key: "ADMIN_SECURITY_CODE",
    label: "Admin Security PIN",
    category: "Admin",
    defaultValue: "",
    description: "High-level security pin for restricted actions",
  },
  {
    key: "DEV_AUTH_BYPASS",
    label: "Development Auth Bypass",
    category: "Development",
    defaultValue: "true",
    description: "Allow fast developer auto-login in local environments",
  },
];

const PRESETS = {
  local_dev: {
    name: "Local Development (Default)",
    description: "Standard local development on port 3000 (front) and 5001 (back) with mock DB fallback",
    values: {
      PORT: "5001",
      NODE_ENV: "development",
      DATABASE_URL: "",
      CORS_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
      APP_URL: "http://localhost:3000",
      VITE_PORT: "3000",
      DEV_AUTH_BYPASS: "true",
      ADMIN_BOOTSTRAP_USERNAME: "admin",
      ADMIN_BOOTSTRAP_EMAIL: "admin@universe.local",
      ADMIN_BOOTSTRAP_PASSWORD: "",
      ADMIN_SECURITY_CODE: "",
    },
  },
  production_standalone: {
    name: "Production Standalone",
    description: "Single-port production service serving built static assets from backend",
    values: {
      PORT: "3000",
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:YOUR_PASSWORD@localhost:5432/universe_civilization",
      CORS_ORIGINS: "http://localhost:3000",
      APP_URL: "http://localhost:3000",
      VITE_PORT: "3000",
      DEV_AUTH_BYPASS: "false",
      ADMIN_BOOTSTRAP_USERNAME: "commander",
      ADMIN_BOOTSTRAP_EMAIL: "commander@universe.galaxy",
      ADMIN_BOOTSTRAP_PASSWORD: "ChangeMeInProd!",
      ADMIN_SECURITY_CODE: "9876",
    },
  },
  cloud_sql: {
    name: "Google Cloud SQL / Neon / Supabase",
    description: "Configured for remote managed PostgreSQL database instance",
    values: {
      PORT: "5001",
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:password@remote-db-host.com:5432/universe_civilization?sslmode=require",
      CORS_ORIGINS: "http://localhost:3000",
      APP_URL: "http://localhost:3000",
      VITE_PORT: "3000",
      DEV_AUTH_BYPASS: "false",
      ADMIN_SECURITY_CODE: "4321",
    },
  },
};

function readExistingEnv() {
  const result = {};
  if (fs.existsSync(ENV_PATH)) {
    const raw = fs.readFileSync(ENV_PATH, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
  }
  return result;
}

function writeEnvFile(values) {
  let content = "# ====================================================\n";
  content += "# UNIVERSE CIVILIZATION & BSAT ENVIRONMENT CONFIG\n";
  content += `# Generated: ${new Date().toISOString()}\n`;
  content += "# ====================================================\n\n";

  const categories = {};
  for (const item of CONFIG_SCHEMA) {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  }

  for (const [category, items] of Object.entries(categories)) {
    content += `### ${category.toUpperCase()} CONFIGURATION\n`;
    for (const item of items) {
      let val = values[item.key];
      if (val === undefined || val === null || val === "") {
        val = typeof item.defaultValue === "function" ? item.defaultValue() : item.defaultValue;
      }
      content += `# ${item.description}\n`;
      content += `${item.key}=${val}\n\n`;
    }
  }

  // Any custom keys not in schema
  const knownKeys = new Set(CONFIG_SCHEMA.map((s) => s.key));
  const customKeys = Object.keys(values).filter((k) => !knownKeys.has(k));
  if (customKeys.length > 0) {
    content += "### CUSTOM CONFIGURATION\n";
    for (const k of customKeys) {
      content += `${k}=${values[k]}\n`;
    }
    content += "\n";
  }

  fs.writeFileSync(ENV_PATH, content, "utf8");
  console.log(`[OK] Saved environment configuration to ${ENV_PATH}`);
}

function printStatus() {
  const current = readExistingEnv();
  console.log("====================================================");
  console.log(" UNIVERSE CIVILIZATION: ENVIRONMENT CONFIG STATUS");
  console.log("====================================================");
  console.log(`File: ${ENV_PATH} [${fs.existsSync(ENV_PATH) ? "FOUND" : "NOT FOUND"}]`);
  console.log("----------------------------------------------------");

  for (const item of CONFIG_SCHEMA) {
    const val = current[item.key];
    const isSet = val !== undefined && val !== "";
    const displayVal = item.category === "Security" || item.key.includes("PASSWORD")
      ? (isSet ? "•••••••• [SET]" : "[NOT SET - GENERATES DEFAULT]")
      : (val || `[DEFAULT: ${typeof item.defaultValue === 'function' ? item.defaultValue() : item.defaultValue}]`);
    console.log(`  ${item.key.padEnd(26)} : ${displayVal}`);
  }
  console.log("====================================================");
}

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) {
    console.error(`[ERROR] Unknown preset: ${presetKey}`);
    console.log("Available presets:", Object.keys(PRESETS).join(", "));
    process.exit(1);
  }
  const current = readExistingEnv();
  const merged = { ...current, ...preset.values };
  if (!merged.SESSION_SECRET) {
    merged.SESSION_SECRET = crypto.randomBytes(32).toString("hex");
  }
  writeEnvFile(merged);
  console.log(`[OK] Applied preset '${preset.name}'`);
}

function interactivePrompt() {
  const current = readExistingEnv();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("====================================================");
  console.log(" INTERACTIVE ENVIRONMENT VARIABLE CONFIGURATOR");
  console.log(" Press ENTER to keep existing/default value");
  console.log("====================================================");

  let idx = 0;
  const newValues = { ...current };

  function askNext() {
    if (idx >= CONFIG_SCHEMA.length) {
      rl.close();
      writeEnvFile(newValues);
      printStatus();
      console.log("\n[SUCCESS] Configuration updated successfully!");
      return;
    }

    const item = CONFIG_SCHEMA[idx++];
    const fallback = current[item.key] || (typeof item.defaultValue === "function" ? item.defaultValue() : item.defaultValue);
    rl.question(`\n[${item.category}] ${item.label} (${item.key})\n${item.description}\nValue [${fallback}]: `, (ans) => {
      newValues[item.key] = ans.trim() || fallback;
      askNext();
    });
  }

  askNext();
}

// CLI handler
const args = process.argv.slice(2);
const command = args[0] || "status";

switch (command) {
  case "status":
    printStatus();
    break;
  case "init":
  case "default": {
    const current = readExistingEnv();
    const defaults = {};
    for (const item of CONFIG_SCHEMA) {
      defaults[item.key] = current[item.key] || (typeof item.defaultValue === "function" ? item.defaultValue() : item.defaultValue);
    }
    writeEnvFile(defaults);
    printStatus();
    break;
  }
  case "preset":
    applyPreset(args[1] || "local_dev");
    break;
  case "interactive":
  case "configure":
    interactivePrompt();
    break;
  case "set": {
    const key = args[1];
    const val = args[2];
    if (!key || val === undefined) {
      console.error("Usage: node env-config.cjs set <KEY> <VALUE>");
      process.exit(1);
    }
    const cur = readExistingEnv();
    cur[key] = val;
    writeEnvFile(cur);
    break;
  }
  default:
    console.log("Usage: node env-config.cjs [status | init | configure | preset <name> | set <KEY> <VAL>]");
    console.log("Presets:", Object.keys(PRESETS).join(", "));
    break;
}

module.exports = {
  CONFIG_SCHEMA,
  PRESETS,
  readExistingEnv,
  writeEnvFile,
};
