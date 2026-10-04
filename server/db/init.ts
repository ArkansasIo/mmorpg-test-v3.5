import { db, pool } from '.';
import { users, adminUsers, playerStates } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await pool.query("SELECT to_regclass($1) AS table_name", [`public.${tableName}`]);
    return Boolean(result.rows?.[0]?.table_name);
  } catch {
    return false;
  }
}

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);

    // Create default admin user if it doesn't exist
    await ensureAdminUser();

    // Create test player accounts
    await ensureTestAccounts();

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function ensureAdminUser() {
  const adminUsername = String(process.env.ADMIN_BOOTSTRAP_USERNAME || '').trim();
  const adminEmail = String(process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim();
  const adminPassword = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || '');
  if (!adminUsername || !adminEmail || adminPassword.length < 12) {
    console.log('ℹ️ Admin bootstrap skipped: ADMIN_BOOTSTRAP_* credentials are not fully configured.');
    return;
  }

  try {
    const usersTableReady = await tableExists('users');
    const adminUsersTableReady = await tableExists('admin_users');
    if (!usersTableReady || !adminUsersTableReady) return;

    const existing = await db.select().from(users).where(eq(users.username, adminUsername));
    let adminUser = existing[0];
    if (!adminUser) {
      const inserted = await db.insert(users).values({
        username: adminUsername,
        passwordHash: hashPassword(adminPassword),
        email: adminEmail,
        createdAt: new Date(),
      }).returning();
      adminUser = inserted[0];
      console.log(`✅ Created configured bootstrap admin: ${adminUsername}`);
    }

    const isAdmin = await db.select().from(adminUsers).where(eq(adminUsers.userId, adminUser.id));
    if (isAdmin.length === 0) {
      await db.insert(adminUsers).values({
        userId: adminUser.id,
        role: process.env.ADMIN_BOOTSTRAP_ROLE || 'founder',
        permissions: ['all'],
        createdAt: new Date(),
      });
      console.log(`✅ Granted admin role to ${adminUsername}`);
    }
  } catch (error) {
    console.warn('⚠️ Could not ensure configured admin:', error);
  }
}
async function ensureTestAccounts() {
  if (process.env.NODE_ENV !== 'development' || !['1','true','yes','on'].includes(String(process.env.ENABLE_DEMO_ACCOUNTS || '').toLowerCase())) return;
  const testAccounts = [
    { username: 'player1', password: String(process.env.DEV_DEMO_PASSWORD || '') },
    { username: 'player2', password: String(process.env.DEV_DEMO_PASSWORD || '') },
    { username: 'player3', password: String(process.env.DEV_DEMO_PASSWORD || '') },
  ].filter(a => a.password.length >= 12);

  for (const account of testAccounts) {
    const existing = await db.select().from(users).where(eq(users.username, account.username));
    if (existing.length === 0) {
      await db.insert(users).values({
        username: account.username,
        passwordHash: hashPassword(account.password),
        email: `${account.username}@universe-empire-domions.game`,
        createdAt: new Date(),
      });
    }
  }
}
// Simple password hashing (use crypto for production)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 });
  return "scrypt$16384$8$1$" + salt.toString("base64url") + "$" + derived.toString("base64url");
}

export async function closeDatabase() {
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
}
