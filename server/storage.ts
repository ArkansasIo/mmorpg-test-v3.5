import { eq, ilike, or } from "drizzle-orm";
import { db } from "./db";
import { users } from "../shared/schema";
import type { InsertUser, User } from "../shared/schema";

export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const normalized = identifier.trim();
    if (!normalized) return undefined;
    const [user] = await db.select().from(users).where(
      normalized.includes("@")
        ? ilike(users.email, normalized)
        : or(ilike(users.username, normalized), ilike(users.email, normalized)),
    ).limit(1);
    return user;
  }

  async createUser(input: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(input).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async updateUser(id: string, patch: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }
}

export const storage = new DatabaseStorage();
