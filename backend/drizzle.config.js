import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.js",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DB_PATH ?? "./data/dev.db",
  },
});
