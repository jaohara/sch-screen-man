import { eq, sql } from "drizzle-orm";

import { db } from "./client.js";
import { content, screens, screenSchedules } from "./schema.js";

// internal helper function for building queries
function selectScheduleWithRelations() {
  return db
    .select({
      id: screenSchedules.id,
      screenId: screenSchedules.screenId,
      contentId: screenSchedules.contentId,
      mdnsHostname: screens.mdnsHostname,
      name: content.name,
      url: content.url,
      start: screenSchedules.start,
      end: screenSchedules.end,
    })
    .from(screenSchedules)
    .innerJoin(screens, eq(screenSchedules.screenId, screens.id))
    .innerJoin(content, eq(screenSchedules.contentId, content.id));
}

export function listScreenSchedules() {
  return selectScheduleWithRelations().all();
}

export function getScreenScheduleById(id) {
  return selectScheduleWithRelations().where(eq(screenSchedules.id, id)).get();
}

export function getScreenSchedulesByScreenId(id) {
  return selectScheduleWithRelations().where(eq(screenSchedules.screenId, id)).all();
}

export function getScreenSchedulesByScreenHostname(mdnsHostname) {
  return selectScheduleWithRelations().where(eq(screens.mdnsHostname, mdnsHostname)).all();
}

export function getScreenSchedulesByContentId(id) {
  return selectScheduleWithRelations().where(eq(screenSchedules.contentId, id)).all();
}

export function createScreenSchedule(values) {
  const newScreenSchedule = {
    contentId: values.contentId,
    screenId: values.screenId,
    start: values.start,
    end: values.end,
  };

  const inserted = db.insert(screenSchedules).values(newScreenSchedule).returning().get();
  return getScreenScheduleById(inserted.id);
}

export function updateScreenSchedule(id, partial) {
  const updatedScreenSchedule = {
    contentId: partial.contentId,
    screenId: partial.screenId,
    start: partial.start,
    end: partial.end,
  };

  db.update(screenSchedules)
    .set({ ...updatedScreenSchedule, updatedAt: sql`(current_timestamp)`})
    .where(eq(screenSchedules.id, id))
    .run();

  return getScreenScheduleById(id);
}

export function deleteScreenSchedule(id) {
  return db.delete(screenSchedules).where(eq(screenSchedules.id, id)).run();
}
