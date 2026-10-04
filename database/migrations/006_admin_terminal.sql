-- Admin systems terminal persistence and audit indexing.
CREATE TABLE IF NOT EXISTS admin_terminal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  command VARCHAR(120) NOT NULL,
  arguments JSONB NOT NULL DEFAULT '{}',
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_terminal_history_admin_created ON admin_terminal_history(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_terminal_history_command ON admin_terminal_history(command, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_created ON admin_logs(action, created_at DESC);
