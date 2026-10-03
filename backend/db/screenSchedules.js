import { eq, sql } from "drizzle-orm";

import { db } from "./client.js";
import { screenSchedules } from "./schema.js";

export function listScreenSchedules() {
  return db.select().from(screenSchedules).all();
}

export function getScreenScheduleById(id) {
  return db.select().from(screenSchedules).where(eq(screenSchedules.id, id)).get();
}


export function getScreenSchedulesByScreenId(id) {
  return db.select().from(screenSchedules).where(eq(screenSchedules.screenId, id)).all();
}

export function getScreenSchedulesByContentId(id) {
  return db.select().from(screenSchedules).where(eq(screenSchedules.contentId, id)).all();
}

export function createScreenSchedule(values) {
  const newScreenSchedule = {
    contentId: values.contentId,
    screenId: values.screenId,
    start: values.start,
    end: values.end,
  };

  return db.insert(screenSchedules).values(newScreenSchedule).returning().get();
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
