-- Align progression queues with the canonical schema.sql tables.
-- building_queues and research_queues already exist in schema.sql.
CREATE INDEX IF NOT EXISTS idx_building_queues_active
  ON building_queues(colony_id, processed, cancelled, end_time);
CREATE INDEX IF NOT EXISTS idx_research_queues_active
  ON research_queues(user_id, processed, cancelled, end_time);

CREATE TABLE IF NOT EXISTS fleet_build_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  colony_id UUID REFERENCES colonies(id) ON DELETE SET NULL,
  ship_class VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fleet_build_queues_active
  ON fleet_build_queues(user_id, processed, cancelled, end_time);