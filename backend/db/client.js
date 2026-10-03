import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB_PATH must point outside the git checkout on deployed hosts (deploy.sh
// runs `git reset --hard` on every push) — see deploy/README.md. Defaults to
// a gitignored dev file so local `npm start` works with no setup.
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "data", "dev.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = drizzle({ connection: DB_PATH });

db.run(sql`PRAGMA journal_mode = WAL`);
db.run(sql`PRAGMA foriegn_keys = ON`)

// Applies any migration in db/migrations/ not yet recorded in the DB.
// Idempotent — safe to call on every server start, fresh file or not.
export function runMigrations() {
  migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });
}
