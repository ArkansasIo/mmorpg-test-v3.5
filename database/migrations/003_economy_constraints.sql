-- Dependency-layer safeguards for the existing economy schema.
CREATE INDEX IF NOT EXISTS idx_resources_colony_type ON resources(colony_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_transactions_user_created ON resource_transactions(user_id, created_at DESC);
ALTER TABLE resource_transactions ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
ALTER TABLE resource_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
CREATE INDEX IF NOT EXISTS idx_resource_transactions_reference ON resource_transactions(reference_type, reference_id);
