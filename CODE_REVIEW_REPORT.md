# Codebase Review: Universe Civilization: Empire at War

**Repository:** `ArkansasIo/universe-civilization-empire-at-war`  
**Commit reviewed:** `e8c8b16` (`feat: initialize project structure and base app`)  
**Review date:** 2026-10-03

## Executive summary

The checkout is **not runnable or buildable as committed**. The principal blocker is repository incompleteness: the frontend imports at least 186 missing local modules, while `server/index.ts` imports a large route/service tree that is absent from the checkout. Documentation also appears to have been copied from an older/different project and does not match `package.json` or the actual directory layout.

There are also high-risk authentication and deployment issues that should be fixed before exposing the application to a network:

- production-capable default admin credentials are hardcoded;
- passwords are stored using unsalted SHA-256;
- password reset returns a new password directly to an unauthenticated caller;
- the CORS policy reflects arbitrary origins while allowing credentials;
- session cookies are not marked `secure` in production;
- admin IP checks trust client-supplied proxy headers.

## Validation performed

| Check | Result |
|---|---|
| `npm install --no-audit --no-fund` | Failed with an `ERESOLVE` peer conflict: Vite 8 requires esbuild `^0.27.0 || ^0.28.0`, while the project declares `esbuild ^0.25.0`. |
| `npm install --legacy-peer-deps` | Completed, but uses a workaround that bypasses peer dependency validation. |
| `npm run build` | Failed: unresolved frontend imports, starting with `src/App.tsx` imports such as `./sound`, `./gameData`, and `./types`. |
| `npm run lint` | Failed: unresolved frontend modules and cascading TypeScript errors. |
| `npm run server:build` | Failed: absent server modules, missing `shared/schema`, ESM extension issues, and additional TypeScript errors. |
| `npm start` | Not defined in `package.json`. |
| `npm run db:push` | Not defined in `package.json`. |

No source changes were made during this review.

## Findings

### Critical: the committed source tree is incomplete

**Evidence:**

- `src/App.tsx:6-206` imports many files that do not exist in the checkout, including `./sound`, `./types`, `./gameData`, `./firebase`, `./config/adminAuthConfig`, numerous views, and data modules.
- A repository-wide relative-import check found **186 unresolved local imports** under `src/`.
- `server/index.ts:4-275` imports route modules, services, `terminalUI`, `static`, `shared/schema`, and other files absent from the checkout.
- The tracked tree contains no `shared/`, `client/`, `script/`, or `server/routes*` implementation despite many docs describing those directories.

**Impact:** neither the client nor server can compile, so the advertised application cannot be run locally from this commit.

**Recommendation:** restore the missing files from the intended source branch/release, or reduce the entrypoints to the subset actually present. Add CI that runs both `npm run build` and a server compile check on every commit.

### High: default admin credentials are hardcoded

**Evidence:**

- `server/db/init.ts:35-93` creates `admin` with password `admin123`.
- `server/basicAuth.ts:212-215` defaults to `admin` / `Admin@12345` when bootstrap variables are absent.
- `server/basicAuth.ts:118` falls back to `dev-secret-key` for session signing.
- `server/basicAuth.ts:15-19` and `server/db/init.ts:99-120` create predictable demo accounts with `password123`.

**Impact:** a production deployment that runs initialization without explicitly configured secrets can expose an administrative account with public, guessable credentials. The fallback session secret also allows session forgery if an attacker can obtain or influence cookies in a deployment using the default.

**Recommendation:** fail closed in production when required secrets are missing. Remove production bootstrap defaults; require one-time, externally supplied credentials or an interactive setup flow. Keep demo users behind an explicit development-only flag, and never create them when `NODE_ENV` is not `development`.

### High: password reset is an unauthenticated account takeover path

**Evidence:** `server/basicAuth.ts:570-597` accepts only `username` and `email`, changes the stored password, and returns `temporaryPassword` in the HTTP response. There is no email/token verification or authenticated recovery step.

**Impact:** anyone who knows or can guess a user’s username and email can reset the account and immediately receive the new password. The endpoint is under the general auth rate limiter, but rate limiting does not make the recovery design safe.

**Recommendation:** issue a short-lived, single-use reset token through a trusted out-of-band channel; never return a password in the API response. Invalidate existing sessions after reset and add audit logging and abuse controls.

### High: passwords use unsalted SHA-256

**Evidence:** `server/basicAuth.ts:132-138` and `server/db/init.ts:128-131` hash passwords with plain SHA-256.

**Impact:** database compromise enables fast offline cracking and identical passwords produce identical hashes.

**Recommendation:** migrate to Argon2id (preferred) or bcrypt/scrypt with a per-password salt and a calibrated work factor. Version password hashes so login can transparently rehash old records.

### High: arbitrary credentialed CORS reflection

**Evidence:** `server/basicAuth.ts:381-390` sets `Access-Control-Allow-Origin` to the request’s `Origin` header without an allowlist and always sets `Access-Control-Allow-Credentials: true`.

**Impact:** any website can be authorized as a cross-origin client for credentialed requests. Depending on browser cookie and SameSite behavior and which state-changing endpoints are present, this increases CSRF and cross-origin data-access risk.

**Recommendation:** configure a fixed production origin allowlist, return no CORS headers for untrusted origins, add `Vary: Origin`, and use CSRF protection for cookie-authenticated state-changing requests.

### High: session cookies are insecure in production

**Evidence:** `server/basicAuth.ts:122-128` sets `secure: false` unconditionally.

**Impact:** cookies can be sent over plaintext HTTP if the application is reachable that way, and the setting contradicts the deployment guidance for a production web app.

**Recommendation:** set `secure: process.env.NODE_ENV === "production"` (or an explicit secure-cookie configuration), enforce HTTPS, and use a persistent production session store instead of `memorystore`.

### Medium: admin IP control trusts `X-Forwarded-For`

**Evidence:** `server/middleware/adminIpCheck.ts:21-33` uses the first `X-Forwarded-For` value directly; `server/basicAuth.ts:379` enables proxy trust.

**Impact:** if the service is reachable without a trusted reverse proxy, a caller may spoof the header and bypass or manipulate the IP restriction. Even behind a proxy, correctness depends on proxy configuration and hop count.

**Recommendation:** use the framework’s proxy-aware `req.ip` only behind a precisely configured trusted proxy, or strip/overwrite forwarding headers at the edge. Do not include the client IP in a 403 response unless it is needed operationally.

### Medium: public Firestore test reads and broad admin directory reads

**Evidence:** `firestore.rules:83-86` allows unauthenticated reads from `/test/{docId}`. `firestore.rules:145-149` permits any signed-in user to list and get `/admins/{adminId}`.

**Impact:** test data can become a public data leak, and signed-in users can enumerate admin records and associated metadata. The public Firebase API key itself is not a secret, but the rules determine the actual exposure.

**Recommendation:** remove the test rule before deployment or restrict it to an emulator/admin role. Limit admin reads to admins and validate immutable identity fields on create/update.

### Medium: frontend state is stored in tamperable local storage

**Evidence:** `src/App.tsx:212-218` loads game state from `localStorage`; many state keys are persisted under `uc_state_*`.

**Impact:** users can modify resources, admin UI state, progression, and login flags from browser developer tools. This is acceptable only for a mock/prototype UI; it is not a security boundary for a multiplayer game.

**Recommendation:** treat the server/database as authoritative for all gameplay and admin actions. Keep local storage limited to non-sensitive preferences and cache data, and validate all mutations server-side.

### Low: dependency and reproducibility problems

**Evidence:**

- `package.json:2` is still named `react-example` and version `0.0.0`.
- There is no `package-lock.json`; the repository has a `bun.lock` but the docs and scripts primarily instruct npm.
- `npm install` fails under normal peer resolution because `vite ^8.3.0` conflicts with `esbuild ^0.25.0`.
- `vite.config.ts:11-12` uses `__dirname`, producing a Vite warning under the current toolchain.
- Windows/Linux launcher scripts assume a server build that currently cannot compile.

**Recommendation:** choose npm or Bun, commit the corresponding lockfile, align Vite/esbuild versions, and make the package name/version match the project. Add a clean-install CI job.

## Documentation audit

### Missing or misleading top-level README

There is no root `README.md`. The repository has `docs/README.md`, but GitHub’s default landing page and the requested setup entrypoint are therefore missing.

### `docs/QUICK_START.md` does not match the code

It references scripts that do not exist (`db:push`, `admin:create`, `admin:manage`), claims a full-stack `npm run dev` flow, and describes a database-driven setup not represented by the current package scripts. It also says to edit `.env` with `DATABASE_URL`, while `.env.example` only documents `GEMINI_API_KEY` and `APP_URL`.

### `docs/INSTALLATION_GUIDE.md` describes a different project layout

It refers to `client/`, `shared/`, `script/`, `server/routes.ts`, `server/vite.ts`, and scripts such as `db:seed`, `db:reset`, and `typecheck` that are absent. Its port claims (Vite 5173 and Express 3000) contradict the actual scripts: `package.json:7` starts Vite on port 3000, and `server/index.ts` defaults to port 5001 near its startup code.

### Other stale references

`docs/SCRIPTS.md`, `docs/PROJECT_STRUCTURE.md`, `docs/BUILD_EXECUTABLE_GUIDE.md`, and several deployment/status documents describe missing directories and scripts. A scan found documented but undefined commands including `admin`, `admin:create`, `admin:manage`, `check`, `db:generate`, `db:push`, `db:reset`, `db:seed`, `db:seed:ogame`, `dev:client`, `dev:server`, `migrate:cron`, `smoke:life-support`, and `typecheck`.

## How to build and run locally (as committed)

### Honest current status

There is **no successful local build/run procedure for this commit**. The following commands are the closest reproducible validation sequence:

```bash
git clone https://github.com/ArkansasIo/universe-civilization-empire-at-war.git
cd universe-civilization-empire-at-war
npm install --legacy-peer-deps   # normal npm install currently fails on Vite/esbuild peer resolution
npm run build                    # currently fails on missing frontend modules
npm run lint                     # currently fails on missing frontend modules/types
npm run server:build             # currently fails on missing server modules
```

`npm run dev` is defined as `vite --port=3000 --host=0.0.0.0`, so **if the missing frontend modules are restored**, the intended client development URL is likely `http://localhost:3000`. The package does not define `npm start`; the server-oriented alternatives are `npm run server:dev` and `npm run server:compile-run`, but both depend on the incomplete backend tree and a database configuration that is not fully documented in `.env.example`.

### Minimum prerequisites once the source tree is restored

- Node.js compatible with the declared toolchain (the current environment used Node 22.13.0).
- npm or Bun, but use only one package manager and its committed lockfile.
- PostgreSQL if the restored backend requires the Drizzle schema.
- Required runtime secrets, including a strong `SESSION_SECRET`; do not use repository defaults.

### Suggested corrected developer workflow

After restoring the missing source files and fixing scripts:

```bash
cp .env.example .env
# Fill in all required variables and generate a strong SESSION_SECRET.
npm ci
npm run lint
npm run build
npm run server:build
npm run server:dev
```

The project should document the exact database initialization command only after that command is added to `package.json` and verified against the checked-in schema/migration files.

## Recommended repair order

1. Restore or intentionally remove the missing frontend/backend source tree; make a clean checkout build.
2. Replace stale documentation with a root README generated from verified scripts and ports.
3. Remove all production default credentials and fail closed when secrets are absent.
4. Migrate password storage to Argon2id/bcrypt and redesign password recovery.
5. Lock down CORS, CSRF, cookies, proxy/IP handling, and Firestore rules.
6. Add CI for clean install, frontend build, backend build, and security/dependency scanning.
