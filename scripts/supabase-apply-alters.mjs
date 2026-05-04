/**
 * Applies SEO + public-site SQL migrations using node-postgres.
 *
 * Why not `supabase db query`? The CLI uses named prepared statements; PgBouncer
 * (Session pooler on port 6543) can error on the 2nd statement with:
 *   prepared statement "lrupsc_1_0" already exists (42P05)
 *
 * `pg` sends each file as a simple query, which poolers handle reliably.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." pnpm migrate:supabase
 *   Or set DATABASE_URL in apps/studio/.env.local
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILES = ["20260504120000_project_seo.sql", "20260504130000_project_public.sql"];

function loadDatabaseUrlFromEnvLocal() {
  const envLocal = path.join(__dirname, "..", "apps", "studio", ".env.local");
  if (!fs.existsSync(envLocal)) return;
  const raw = fs.readFileSync(envLocal, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === "DATABASE_URL" && val) {
      process.env.DATABASE_URL = val;
      return;
    }
  }
}

loadDatabaseUrlFromEnvLocal();

const url = process.env.DATABASE_URL;
if (!url || !url.trim()) {
  console.error(
    "Set DATABASE_URL (Session pooler URI, port 6543) or add it to apps/studio/.env.local.\n" +
      "Dashboard → Database → Connection string → Session pooler."
  );
  process.exit(1);
}

const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");

const ssl =
  /localhost|127\.0\.0\.1/i.test(url) && !/sslmode=require/i.test(url)
    ? undefined
    : { rejectUnauthorized: false };

const client = new pg.Client({ connectionString: url.trim(), ssl });

try {
  await client.connect();
  for (const file of FILES) {
    const full = path.join(migrationsDir, file);
    if (!fs.existsSync(full)) {
      console.error("Missing migration file:", full);
      process.exit(1);
    }
    const sql = fs.readFileSync(full, "utf8");
    console.log("Applying", file);
    await client.query(sql);
  }
  console.log("Migrations applied successfully.");
} catch (err) {
  console.error(err.message || err);
  if (/db\.[^.]+\.supabase\.co:5432/i.test(url)) {
    console.error(
      "\nTip: Use the Session pooler host (aws-0-*.pooler.supabase.com:6543), not db.*:5432,\n" +
        "unless you have IPv6 routing — direct DB URLs often fail with 'no route to host'."
    );
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
