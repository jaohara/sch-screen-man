// One-off migration of the existing pi-conf.js data into the DB. Idempotent —
// safe to re-run; skips screens already present by mdnsHostname and reuses an
// existing content row for a URL rather than duplicating it.
//
// Usage: node db/seed.js

import { eq } from "drizzle-orm";

import { piConfig } from "../pi-conf.js";
import { db, runMigrations } from "./client.js";
import { screens, content, settings } from "./schema.js";

runMigrations();

function findOrCreateContent(url) {
  if (!url) return null;
  const existing = db.select().from(content).where(eq(content.url, url)).get();
  if (existing) return existing.id;
  return db.insert(content).values({ name: url, url }).returning().get().id;
}

if (!db.select().from(settings).get()) {
  db.insert(settings).values({}).run();
  console.log("Seeded default settings row.");
}

for (const pi of piConfig) {
  const existing = db.select().from(screens).where(eq(screens.mdnsHostname, pi.mdnsHostname)).get();
  if (existing) {
    console.log(`Skipping ${pi.mdnsHostname} — already seeded.`);
    continue;
  }

  const defaultContentId = findOrCreateContent(pi.screenUrl);

  db.insert(screens).values({
    name: pi.name,
    mdnsHostname: pi.mdnsHostname,
    ip: pi.ip ?? null,
    username: pi.username,
    password: pi.password,
    groupName: pi.group,
    positionDescription: pi.positionDescription ?? null,
    displayOrder: pi.order ?? null,
    note: pi.note ?? null,
    defaultContentId,
  }).run();

  console.log(`Seeded screen ${pi.mdnsHostname}.`);
}

console.log("Seed complete.");
