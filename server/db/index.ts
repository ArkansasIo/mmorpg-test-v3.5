import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../shared/schema";

const databaseUrl = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || "";

if (!databaseUrl.trim()) {
  console.error("❌ DATABASE_URL is not configured.");
  console.error("   Copy .env.example to .env and set DATABASE_URL to your PostgreSQL connection string.");
  console.error("   Example: postgresql://postgres:YOUR_PASSWORD@localhost:5432/universe_civilization");
}

function describeDatabaseTarget(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const host = url.hostname || "localhost";
    const port = url.port || "5432";
    const database = url.pathname.replace(/^\//, "") || "(default)";
    const user = decodeURIComponent(url.username || "postgres");
    return `${user}@${host}:${port}/${database}`;
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

function describeDatabaseError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const details = error as Error & { code?: string; errno?: string; address?: string; port?: number };
  const parts = [error.message];
  if (details.code) parts.push(`code=${details.code}`);
  if (details.address) parts.push(`address=${details.address}`);
  if (details.port) parts.push(`port=${details.port}`);
  return parts.join(" | ");
}

console.log("🔌 Connecting to database...");
console.log(`   Target: ${describeDatabaseTarget(databaseUrl)}`);

export const pool = new Pool({
  connectionString: databaseUrl || undefined,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: Number.parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
  max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
});

let databaseReady = false;

pool.connect()
  .then(client => {
    databaseReady = true;
    console.log("✅ Database connection established");
    client.release();
  })
  .catch(error => {
    databaseReady = false;
    console.error("❌ Database connection failed:", describeDatabaseError(error));
    console.error("   Check that PostgreSQL is running and that DATABASE_URL points to the correct host, port, database, and credentials.");
    console.error("   Example local URL: postgresql://postgres:YOUR_PASSWORD@localhost:5432/universe_civilization");
  });

pool.on("error", error => {
  databaseReady = false;
  console.error("❌ Unexpected PostgreSQL pool error:", describeDatabaseError(error));
});

export const db = drizzle({ client: pool, schema });

export function isDatabaseReady(): boolean {
  return databaseReady;
}

export async function checkDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    databaseReady = true;
  } finally {
    client.release();
  }
}

export async function runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return await db.transaction(fn);
}

export async function shutdownDb() {
  try {
    await pool.end();
    databaseReady = false;
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
}
