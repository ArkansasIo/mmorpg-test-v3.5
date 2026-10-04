# Universe Civilization: Empire at War

Full-stack React/Vite + TypeScript/Express + PostgreSQL/Drizzle strategy MMO prototype.

## Stack

- Frontend: React 19 + Vite 8 + Three.js
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Drizzle ORM
- Authentication: server-side sessions with scrypt password hashing
- Security: allow-listed CORS, secure production cookies, rate limiting, admin IP controls, CodeQL/dependency-review CI
- Windows tooling: native launcher scripts and .NET tools

## Local setup

1. Copy `.env.example` to `.env`.
2. Configure `DATABASE_URL`.
3. Generate a random `SESSION_SECRET` of at least 32 characters.
4. Set `CORS_ORIGINS` to the exact browser origins you trust.
5. In production, configure `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, and `ADMIN_SECURITY_CODE`; there are no production defaults.
6. Install dependencies: `npm install --no-audit --no-fund`.
7. Validate: `npm run check`.
8. Start the backend: `npm run server:start`.
9. During development, run the frontend separately: `npm run dev`.

## Validation commands

- `npm run lint` — TypeScript check for the frontend
- `npm run build` — Vite production build
- `npm run server:build` — backend TypeScript build
- `npm run check` — all three checks
- `npm run test:dependency` — dependency smoke test
- `npm run server:dev` — backend development server
- `npm run dev` — frontend development server

## Database

The checked-in schema is `database/schema.sql`, with incremental migrations under `database/migrations/`. PostgreSQL is authoritative for multiplayer state; browser local storage is not a security boundary.

If PostgreSQL is unavailable, the backend should be treated as unavailable rather than silently inventing production credentials or authoritative state.

## Security notes

- Never commit `.env` or real credentials.
- Production requires a strong `SESSION_SECRET` and explicit admin bootstrap credentials.
- Passwords are stored with salted scrypt hashes; legacy SHA-256 hashes are upgraded on successful login.
- Self-service password reset is disabled until a verified out-of-band reset-token flow is configured.
- Credentialed CORS is restricted to `CORS_ORIGINS`; arbitrary origin reflection is disabled.
- Production session cookies use `Secure`, `HttpOnly`, and `SameSite=Lax`.
- Admin IP checks use Express's proxy-aware `req.ip`; configure `TRUST_PROXY` only when a trusted reverse proxy is actually present.
- The repository CI runs frontend/backend builds and security analysis.
- The default Express MemoryStore is for development only; production should use a persistent session store before public deployment.

## Current repository status

The previously incomplete frontend and backend source trees have been restored, including the game views, data systems, Express services/routes, shared schema/configuration, and server build configuration. The repository now has no unresolved relative imports from `src/App.tsx`.

A GitHub Actions build is used as the authoritative clean-checkout validation after changes are pushed.
