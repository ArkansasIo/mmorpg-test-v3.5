import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { db, isDatabaseReady, shutdownDb } from "./db";
import { users } from "../shared/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { registerAdminTerminalRoutes } from "./routes-admin-terminal";
import { registerCoreGameRoutes } from "./routes-core-game";
import { registerCronRoutes } from "./routes-cron";
import { startCronEngine, stopCronEngine } from "./services/cronEngine";

const app = express();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });
const port = Number.parseInt(process.env.PORT || "5001", 10);
const SessionStore = MemoryStoreFactory(session);
const distDir = path.resolve(process.cwd(), "dist");
const indexFile = path.join(distDir, "index.html");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const sessionSecret = process.env.SESSION_SECRET?.trim();

if (isProduction && (!sessionSecret || sessionSecret.length < 32)) {
  throw new Error("SESSION_SECRET must be set to at least 32 characters in production.");
}

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || process.env.APP_URL || "")
    .split(",")
    .map(value => value.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
  next();
});

app.use(session({
  name: "connect.sid",
  secret: sessionSecret || crypto.randomBytes(32).toString("hex"),
  store: new SessionStore({ checkPeriod: 86_400_000 }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 });
  return "scrypt$16384$8$1$" + salt.toString("base64url") + "$" + derived.toString("base64url");
}

function verifyPassword(password: string, encoded: string): { valid: boolean; needsUpgrade: boolean } {
  if (encoded.startsWith("scrypt$")) {
    const [, nText, rText, pText, saltText, hashText] = encoded.split("$");
    const n = Number(nText), r = Number(rText), p = Number(pText);
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(r) || !Number.isSafeInteger(p) || !saltText || !hashText) return { valid: false, needsUpgrade: false };
    try {
      const salt = Buffer.from(saltText, "base64url");
      const expected = Buffer.from(hashText, "base64url");
      const actual = crypto.scryptSync(password, salt, expected.length, { N: n, r, p, maxmem: 32 * 1024 * 1024 });
      return { valid: actual.length === expected.length && crypto.timingSafeEqual(actual, expected), needsUpgrade: false };
    } catch { return { valid: false, needsUpgrade: false }; }
  }
  const legacy = crypto.createHash("sha256").update(password).digest("hex");
  return { valid: legacy.length === encoded.length && crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(encoded)), needsUpgrade: true };
}

app.get("/api/status/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({
      ok: true,
      status: "healthy",
      database: isDatabaseReady() ? "ready" : "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      status: "degraded",
      database: "unavailable",
      message: error instanceof Error ? error.message : "Database unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const identifier = String(req.body?.username || req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    if (!identifier || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    const [user] = await db.select().from(users).where(
      identifier.includes("@")
        ? ilike(users.email, identifier)
        : or(ilike(users.username, identifier), ilike(users.email, identifier)),
    ).limit(1);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const passwordCheck = verifyPassword(password, user.passwordHash);
    if (!passwordCheck.valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (passwordCheck.needsUpgrade) await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, user.id));
    if (user.isBanned) {
      return res.status(403).json({ message: user.banReason || "Account is banned" });
    }

    req.session.userId = user.id;
    await new Promise<void>((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    res.json({ message: "Login successful", user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/auth/me", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ authenticated: false });
  const [user] = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    isBanned: users.isBanned,
  }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.isBanned) {
    req.session.destroy(() => undefined);
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user });
});

registerAdminTerminalRoutes(app);
registerCronRoutes(app);

async function bootstrap() {
  await registerCoreGameRoutes(app);
  startCronEngine();

  app.use(express.static(distDir));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(503).json({
    ok: false,
    message: "Frontend build not found.",
    hint: "Run npm run build before starting the production server.",
    expected: indexFile,
  });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  res.status(500).json({ ok: false, message: err instanceof Error ? err.message : "Internal Server Error" });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log("================================================");
  console.log(" UNIVERSE CIVILIZATION SERVER");
  console.log("================================================");
  console.log(`Environment: ${nodeEnv}`);
  console.log(`API:    http://localhost:${port}/api`);
  console.log(`Health: http://localhost:${port}/api/status/health`);
  console.log(`Admin:  http://localhost:${port}/api/admin/terminal/menu`);
  console.log(`Web:    http://localhost:${port}/`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error(`Stop the existing server or start this server on another port, for example: PORT=${port + 1}`);
    process.exitCode = 1;
    return;
  }
  console.error("Server failed to start:", error);
  process.exitCode = 1;
});

const shutdown = async (signal: string) => {
  console.log("Received " + signal + "; shutting down...");
  stopCronEngine();
  server.close(async () => {
    await shutdownDb();
    process.exit(0);
  });
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

}

void bootstrap().catch((error) => {
  console.error("Failed to initialize server:", error);
  process.exitCode = 1;
});
