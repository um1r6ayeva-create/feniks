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
  await sql`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW())`;
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

export type Review = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

export async function getReviews(): Promise<Review[]> {
  if (!process.env.DATABASE_URL) return [];
  await initDB();
  const sql = getSQL();
  const rows = await sql`SELECT id, name, message, created_at::text as created_at FROM reviews ORDER BY created_at DESC LIMIT 50` as Record<string, unknown>[];
  return rows.map(r => ({
    id: Number(r.id),
    name: String(r.name),
    message: String(r.message),
    created_at: String(r.created_at),
  }));
}

export async function addReview(name: string, message: string): Promise<Review | null> {
  if (!process.env.DATABASE_URL) return null;
  await initDB();
  const sql = getSQL();
  const rows = await sql`INSERT INTO reviews (name, message) VALUES (${name}, ${message}) RETURNING id, name, message, created_at::text as created_at` as Record<string, unknown>[];
  if (rows.length === 0) return null;
  return {
    id: Number(rows[0].id),
    name: String(rows[0].name),
    message: String(rows[0].message),
    created_at: String(rows[0].created_at),
  };
}
