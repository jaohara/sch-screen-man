import { eq, sql } from "drizzle-orm";

import { db } from "./client.js";
import { screens, screenGroups } from "./schema.js";

function selectScreenGroupsWithScreenCount() {
  return db
    .select({
      id: screenGroups.id,
      name: screenGroups.name,
      prettyName: screenGroups.prettyName,
      hidden: screenGroups.hidden,
      screenCount: sql`count(${screens.id})`.as("screen_count"),
    })
    .from(screenGroups)
    .leftJoin(screens, eq(screens.groupId, screenGroups.id))
    .groupBy(screenGroups.id);
}

export function listScreenGroups(
  excludeEmpty = true,
  excludeHidden = false,
) {
  const query = selectScreenGroupsWithScreenCount();

  let rows = query.all();

  if (excludeHidden) {
    rows = rows.filter((row) => !row.hidden);
  }

  if (excludeEmpty) {
    rows = rows.filter((row) => row.screenCount > 0);
  }

  return rows;
}

export function getScreenGroupById(id) {
  return selectScreenGroupsWithScreenCount().where(eq(screenGroups.id, id)).get();
}

export function getScreenGroupByName(name) {
  return selectScreenGroupsWithScreenCount().where(eq(screenGroups.name, name)).get();
}

export function createScreenGroup(values) {
  const newScreenGroup = {
    name: values.name,
    hidden: values.hidden,
    prettyName: values.prettyName,
  };

  const inserted = db.insert(screenGroups).values(newScreenGroup).returning().get();

  return getScreenGroupById(inserted.id);
}

export function updateScreenGroup(id, partial) {
  const updatedScreenGroup = {
    name: partial.name,
    hidden: partial.hidden,
    prettyName: partial.prettyName,
  };

  db.update(screenGroups)
    .set({ ...updatedScreenGroup, updatedAt: sql`(current_timestamp)` })
    .where(eq(screenGroups.id, id))
    .run();

  return getScreenGroupById(id) 
}

export function deleteScreenGroup(id) {
  return db.delete(screenGroups).where(eq(screenGroups.id, id)).run();
}
