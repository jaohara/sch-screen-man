import { eq } from "drizzle-orm";

import { db } from "./client.js";
import { settings } from "./schema.js";

const SETTINGS_ID = 1;

export function getSettings() {
  return db.select().from(settings).where(eq(settings.id, SETTINGS_ID)).get();
}

export function updateSettings(partial) {
  db.update(settings).set(partial).where(eq(settings.id, SETTINGS_ID)).run();
  return getSettings();
}
