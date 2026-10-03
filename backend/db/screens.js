import { eq, sql } from "drizzle-orm";

import { db } from "./client.js";
import { screens } from "./schema.js";

export function listScreens() {
  return db.select().from(screens).all();
}

export function getScreenByHostname(mdnsHostname) {
  return db.select().from(screens).where(eq(screens.mdnsHostname, mdnsHostname)).get();
}

export function getScreenById(id) {
  return db.select().from(screens).where(eq(screens.id, id)).get();
}

export function createScreen(values) {
  return db.insert(screens).values(values).returning().get();
}

// TODO: Should updating and deleting screens be easily done via API?
//  How do I secure access to these, particularly delete?
export function updateScreen(id, partial) {
  db.update(screens)
    .set({ ...partial, updatedAt: sql`(current_timestamp)` })
    .where(eq(screens.id, id))
    .run();

  return getScreenById(id);
}

export function deleteScreenById(id) {
  return db.delete(screens).where(eq(screens.id, id)).run();
}
