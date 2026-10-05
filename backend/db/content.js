import { eq, sql } from "drizzle-orm";

import { db } from "./client.js";
import { content, screens, screenSchedules } from "./schema.js";

function selectContentWithRelations() {
  return db
    .select({
      id: content.id,
      name: content.name,
      url: content.url,
      screenMdnsHostname: screens.mdnsHostname,
      screenName: screens.name,
    })
    .from(content)
    .leftJoin(screenSchedules, eq(content.id, screenSchedules.contentId))
    .leftJoin(screens, eq(screenSchedules.screenId, screens.id));
}

// Flattens the joined rows from selectContentWithRelations() into one object
// per content row, with its matched screens nested as a list (empty if none).
function groupContentWithRelations(rows) {
  const contentById = new Map();

  for (const row of rows) {
    if (!contentById.has(row.id)) {
      contentById.set(row.id, { id: row.id, name: row.name, url: row.url, screens: [] });
    }

    if (row.screenMdnsHostname !== null) {
      contentById.get(row.id).screens.push({ mdnsHostname: row.screenMdnsHostname, name: row.screenName });
    }
  }

  return [...contentById.values()];
}

export function listContentWithRelations() {
  return groupContentWithRelations(selectContentWithRelations().all());
}

export function listContent() {
  return db.select().from(content).all();
}

export function getContentById(id) {
  return db.select().from(content).where(eq(content.id, id)).get();
}

export function getContentByIdWithRelations(id) {
  const rows = selectContentWithRelations().where(eq(content.id, id)).all();
  return groupContentWithRelations(rows)[0] ?? null;
}

export function createContent({ name, url }) {
  return db.insert(content).values({ name, url }).returning().get();
}

export function updateContent(id, partial) {
  db.update(content)
    .set({ ...partial, updatedAt: sql`(current_timestamp)` })
    .where(eq(content.id, id))
    .run();
  return getContentById(id);
}

export function deleteContent(id) {
  return db.delete(content).where(eq(content.id, id)).run();
}
