CREATE TABLE IF NOT EXISTS build_queues (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
 building_type VARCHAR(100) NOT NULL, target_level INTEGER NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 completes_at TIMESTAMPTZ NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'queued'
);
CREATE TABLE IF NOT EXISTS research_queues (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 technology_id VARCHAR(100) NOT NULL, target_level INTEGER NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 completes_at TIMESTAMPTZ NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'queued'
);
CREATE TABLE IF NOT EXISTS fleet_queues (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 colony_id UUID REFERENCES colonies(id) ON DELETE SET NULL, ship_type VARCHAR(100) NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity>0), started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 completes_at TIMESTAMPTZ NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'queued'
);
CREATE INDEX IF NOT EXISTS idx_build_queues_colony_status ON build_queues(colony_id,status,completes_at);
CREATE INDEX IF NOT EXISTS idx_research_queues_user_status ON research_queues(user_id,status,completes_at);
CREATE INDEX IF NOT EXISTS idx_fleet_queues_user_status ON fleet_queues(user_id,status,completes_at);