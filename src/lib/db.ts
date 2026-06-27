import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

function getSQL() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    _sql = neon(url);
  }
  return _sql;
}

let _initialized = false;

async function initDB() {
  if (_initialized || !process.env.DATABASE_URL) return;
  const sql = getSQL();
  await sql`CREATE TABLE IF NOT EXISTS site_data (key TEXT PRIMARY KEY, value TEXT NOT NULL)`;
  _initialized = true;
}

export async function getData(key: string): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;
  await initDB();
  const sql = getSQL();
  const rows = await sql`SELECT value FROM site_data WHERE key = ${key}` as Record<string, unknown>[];
  return rows.length > 0 ? String(rows[0].value) : null;
}

export async function setData(key: string, value: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  await initDB();
  const sql = getSQL();
  await sql`INSERT INTO site_data (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
}
