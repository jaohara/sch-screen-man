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


// createScreen and deleteScreenByID will be hooked up to an API route but not exposed
//  via UI controls. For the current scope, it's expected that these will be manually managed
//  by someone at setup time or during maintenance, not during everyday use.

// Behavior could be revisited in a later spec with permissions gating

export function createScreen(values) {
  const newScreen = {
    name: values.name,
    mdnsHostname: values.mdnsHostname,
    ip: values.ip,
    username: values.username,
    password: values.password,
    groupName: values.groupName,
    positionDescription: values.positionDescription,
    displayOrder: values.displayOrder,
    note: values.note,
    // explicitly omitting defaultContentId for now
  }; 

  return db.insert(screens).values(newScreen).returning().get();
}

export function updateScreen(id, partial) {
  const updatedScreen = {
    name: partial.name,
    mdnsHostname: partial.mdnsHostname,
    ip: partial.ip,
    username: partial.username,
    password: partial.password,
    groupName: partial.groupName,
    positionDescription: partial.positionDescription,
    displayOrder: partial.displayOrder,
    note: partial.note,
    defaultContentId: partial.defaultContentId,
  }; 

  db.update(screens)
    .set({ ...updatedScreen, updatedAt: sql`(current_timestamp)` })
    .where(eq(screens.id, id))
    .run();

  return getScreenById(id);
}

export function deleteScreenById(id) {
  return db.delete(screens).where(eq(screens.id, id)).run();
}
