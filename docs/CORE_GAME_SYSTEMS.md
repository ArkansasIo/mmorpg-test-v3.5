# Core Game Systems

This layer makes the server authoritative for economy, progression, infrastructure, research, fleet production, combat, exploration and the player market. The browser client contains typed API functions and preview calculators only.

## Server systems
- Persistent JSONB player state in PostgreSQL.
- Resource production and population growth.
- Building upgrades with escalating costs and caps.
- Research progression and technology modifiers.
- Ship construction and fleet power.
- PvP and PvE combat with casualty resolution and battle records.
- Deep-space exploration with cooldowns and rewards.
- Player market orders and purchases.
- Experience, levels and turns.
- Server-side validation of all costs, quantities and cooldowns.

## Client systems
- `src/lib/gameClient.ts`: authenticated REST client.
- `src/lib/gameLogic.ts`: deterministic UI calculators.
- Client never submits authoritative balances, fleet counts or research levels.

## API
GET /api/game/catalog
GET /api/game/state
POST /api/game/tick
POST /api/game/buildings/:id/upgrade
POST /api/game/research/:id
POST /api/game/ships/:id/build {quantity}
POST /api/game/battle {defenderId,mode}
POST /api/game/exploration {type}
GET /api/game/market
POST /api/game/market/orders {resource,amount,unitPrice}
POST /api/game/market/orders/:id/buy

## Security
Mutating endpoints require an authenticated session. Server-side state is authoritative. PostgreSQL persistence survives restarts. Do not implement privileged gameplay mutations in React.

## EXE
UniverseServer.exe is a Windows launcher for the authoritative Node server. UniverseClient.exe starts the browser client. The EXEs do not embed game state; the TypeScript server and PostgreSQL database remain the source of truth.

## Extension map
The same authoritative pattern should be used for alliances, diplomacy, officers, formations, ACS, espionage, defenses, megastructures, stargates, quests, achievements, events, rankings and administration.