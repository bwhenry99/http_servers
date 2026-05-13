import { boolean } from "drizzle-orm/pg-core";
import { date } from "drizzle-orm/mysql-core";
import { pgTable, timestamp, varchar, uuid, PgVarcharBuilder } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashed_password: varchar("hashed_password").notNull().default('unset'),
  isChirpyRed: boolean("is_chirpy_red").default(false)
});

export type NewUser = typeof users.$inferInsert;

export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: varchar("body", {length: 256}).notNull(),
  userId: uuid("userId").references(() => users.id, {onDelete: 'cascade'}).notNull()
});

export type NewChirp = typeof chirps.$inferInsert;

export const refresh_tokens = pgTable("refresh_tokens", {
  token: varchar("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  expires_at: timestamp("expires_at").notNull().default(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)),
  revoked_at: timestamp("revoked_at"),
  userId: uuid("userId").references(() => users.id, {onDelete: 'cascade'}).notNull()
});

export type NewRefresh = typeof refresh_tokens.$inferInsert;