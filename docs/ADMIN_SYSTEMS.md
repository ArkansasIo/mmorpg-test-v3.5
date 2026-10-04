# Admin Systems

The administration stack has three synchronized surfaces: web GUI, server API, and a Windows EXE.

## Web GUI
Admin Control Panel -> Admin Systems Terminal provides live status cards, role/permission display, command selection, parameter input, execution output, and recent terminal history.

## API
- GET /api/admin/dashboard: authenticated role, permissions, menu, and live status.
- GET /api/admin/terminal/menu: permission-filtered command menu.
- POST /api/admin/terminal/execute: allow-listed administrative commands.
- GET /api/admin/terminal/history: administrator terminal history.

Arbitrary SQL is not exposed.

## Windows EXE
Project: tools/AdminSystemsTerminal/AdminSystemsTerminal.csproj
Build: npm run build:admin-terminal
Output: UniverseAdminTerminal.exe

The executable authenticates against /api/auth/login, keeps the session cookie in memory, loads the server-authoritative admin menu, and executes only allow-listed commands. Credentials are never persisted.

## Security
All administrative API operations require a real session and an adminUsers record with the requested permission. Production credentials must be configured through environment variables; no production credentials are embedded in the client or EXE.
