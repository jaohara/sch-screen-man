import { eq, sql } from "drizzle-orm";

import { db } from "./client.js";
import { content } from "./schema.js";

export function listContent() {
  return db.select().from(content).all();
}

export function getContentById(id) {
  return db.select().from(content).where(eq(content.id, id)).get();
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
  db.delete(content).where(eq(content.id, id)).run();
}
