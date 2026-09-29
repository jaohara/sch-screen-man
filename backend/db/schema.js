import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Single-row app config. getSettings()/updateSettings() in settings.js always
// operate on id 1 — seed.js is responsible for inserting that row once.
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fahrenheitTemps: integer("fahrenheit_temps", { mode: "boolean" }).notNull().default(true),
  memoryWarnPercent: integer("memory_warn_percent").notNull().default(85),
  memoryUrgentPercent: integer("memory_urgent_percent").notNull().default(95),
});

// Menu content: a name + the URL a screen displays. `screens.defaultContentId`
// points here; the future schedule table will add time-windowed overrides.
export const content = sqliteTable("content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// Mirrors pi-conf.js's piConfig entries. `mdnsHostname` is the closest thing
// to a stable identifier today — the planned hostname-as-ID migration hasn't
// happened yet, so `id` here is still an internal surrogate key, not the
// array-index convention the rest of the app currently uses.
export const screens = sqliteTable("screens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  mdnsHostname: text("mdns_hostname").notNull().unique(),
  ip: text("ip"),
  username: text("username").notNull(),
  password: text("password").notNull(),
  groupName: text("group_name"),
  positionDescription: text("position_description"),
  displayOrder: integer("display_order"),
  note: text("note"),
  defaultContentId: integer("default_content_id").references(() => content.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});
