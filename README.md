# Universe Civilization: Empire at War

Full-stack React/Vite + TypeScript/Express + PostgreSQL/Drizzle strategy MMO prototype.

## Architecture

- Frontend: React 19 + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Drizzle ORM
- Authentication: server-side sessions
- Admin: server-side RBAC with audited allow-listed commands
- Windows tooling: .NET 8 launchers, developer IDE, and admin terminal

## Requirements

- Node.js 22+
- npm 10+
- PostgreSQL 16+
- .NET 8 SDK only when building Windows tools

## Local setup

1. Copy .env.example to .env.
2. Configure an existing PostgreSQL database in DATABASE_URL.
3. Set SESSION_SECRET to a random value of at least 32 characters.
4. Set CORS_ORIGINS=http://localhost:3000.
5. Install dependencies: npm install --no-audit --no-fund
6. Validate: npm run lint, npm run build, npm run server:build
7. Run the backend: npm run server:start
8. During development, run the frontend separately: npm run dev

## PostgreSQL troubleshooting

The Windows server launcher performs a TCP preflight but does not install PostgreSQL or invent credentials.

If you see ECONNREFUSED, start PostgreSQL and verify:

    Test-NetConnection localhost -Port 5432

Then check that DATABASE_URL uses the correct host, port, database, username, and password.

The checked-in database schema and migrations must be applied before database-backed features are used.

## Health endpoint

GET /api/status/health returns HTTP 200 when PostgreSQL is queryable and HTTP 503 when it is unavailable.

## Main scripts

- npm run dev — Vite development server on port 3000
- npm run build — frontend production build
- npm run lint — frontend TypeScript check
- npm run server:build — backend TypeScript build
- npm run server:start — compiled backend
- npm run server:dev — backend watch mode
- npm run server:compile-run — compile then start backend
- npm run build:server-launcher — Windows launcher
- npm run build:developer-ide — Windows developer IDE
- npm run build:admin-terminal — Windows admin terminal

## Security

- Never commit .env or real credentials.
- Production requires an explicit 32+ character session secret.
- Credentialed CORS is allowlisted; arbitrary origin reflection is disabled.
- Browser local storage is not a security boundary for multiplayer state; authoritative game state belongs on the server/database.
