import { eq } from "drizzle-orm";

import { db } from "./client.js";
import { screens } from "./schema.js";

export function listScreens() {
  return db.select().from(screens).all();
}

export function getScreenByHostname(mdnsHostname) {
  return db.select().from(screens).where(eq(screens.mdnsHostname, mdnsHostname)).get();
}

export function getScreensById(id) {
  return db.select().from(screens).where(eq(screens.id, id)).get();
}

export function createScreen(values) {
  return db.insert(screens).values(values).returning().get();
}
