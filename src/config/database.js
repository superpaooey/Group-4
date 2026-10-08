import dotenv from 'dotenv';
import pg from 'pg';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const { Pool } = pg;
const sqliteFile = process.env.DB_PATH || path.join(process.cwd(), 'data', 'app.sqlite');
const sqliteSchema = `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS token_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

const postgresSchema = `
  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS token_blacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`;

const sqliteEnabled = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'test' || (!process.env.DATABASE_URL && !process.env.DB_HOST);
let sqliteDb = null;

const initializeSqlite = () => {
  if (sqliteDb) {
    return sqliteDb;
  }

  fs.mkdirSync(path.dirname(sqliteFile), { recursive: true });
  sqliteDb = new Database(sqliteFile);
  sqliteDb.exec(sqliteSchema);

  const count = sqliteDb.prepare('SELECT COUNT(*) AS count FROM students').get();
  if (Number(count.count) === 0) {
    sqliteDb.prepare("INSERT INTO students (name) VALUES ('student1')").run();
  }

  return sqliteDb;
};

const makeSqliteResult = (rows, rowCount = rows.length) => ({ rows, rowCount, command: 'SQLITE' });
const normalizeSqliteQuery = (sql) => String(sql).replace(/\$(\d+)/g, '?');
const normalizeSqliteParams = (params = []) => params.map((param) => (param instanceof Date ? param.toISOString() : param));

const sqliteQuery = (sql, params = []) => {
  const db = initializeSqlite();
  const normalizedSql = normalizeSqliteQuery(String(sql).trim());
  const statement = db.prepare(normalizedSql);
  const normalizedParams = normalizeSqliteParams(params);
  const hasReturningClause = /\bRETURNING\b/i.test(normalizedSql);

  if (/^\s*SELECT/i.test(normalizedSql) || hasReturningClause) {
    const rows = statement.all(...normalizedParams);
    return makeSqliteResult(rows, rows.length);
  }

  const info = statement.run(...normalizedParams);
  return makeSqliteResult([], info.changes ?? 0);
};

const sqliteConnect = () => ({
  query: async (sql, params = []) => sqliteQuery(sql, params),
  release: () => undefined,
});

const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'group4',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: false,
});

const pool = {
  async query(sql, params = []) {
    if (sqliteEnabled) {
      return sqliteQuery(sql, params);
    }

    return postgresPool.query(sql, params);
  },
  async connect() {
    if (sqliteEnabled) {
      return sqliteConnect();
    }

    return postgresPool.connect();
  },
};

export default pool;

export const ensureDatabase = async () => {
  if (!sqliteEnabled) {
    await postgresPool.query(postgresSchema);
    const result = await postgresPool.query('SELECT COUNT(*) AS count FROM students');
    if (Number(result.rows[0].count) === 0) {
      await postgresPool.query("INSERT INTO students (name) VALUES ('student1')");
    }
    return;
  }

  const db = initializeSqlite();

  const count = db.prepare('SELECT COUNT(*) AS count FROM students').get();
  if (Number(count.count) === 0) {
    db.prepare("INSERT INTO students (name) VALUES ('student1')").run();
  }
};
