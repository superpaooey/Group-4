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

let sqliteEnabled = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'test' || (!process.env.DATABASE_URL && !process.env.DB_HOST);
let sqliteDb = sqliteEnabled ? null : null;

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

  sqliteEnabled = true;
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
  host: process.env.DB_HOST || '34.142.204.153',
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME || 'db_group4',
  user: process.env.DB_USER || 'group4',
  password: process.env.DB_PASSWORD || 'wm5bG0ZsQfYG',
  ssl: false,
});

const pool = {
  async query(sql, params = []) {
    if (sqliteEnabled) {
      return sqliteQuery(sql, params);
    }

    try {
      return await postgresPool.query(sql, params);
    } catch (error) {
      sqliteEnabled = true;
      return sqliteQuery(sql, params);
    }
  },
  async connect() {
    if (sqliteEnabled) {
      return sqliteConnect();
    }

    try {
      return await postgresPool.connect();
    } catch (error) {
      sqliteEnabled = true;
      initializeSqlite();
      return sqliteConnect();
    }
  },
};

export default pool;

export const ensureDatabase = async () => {
  const db = initializeSqlite();

  const count = db.prepare('SELECT COUNT(*) AS count FROM students').get();
  if (Number(count.count) === 0) {
    db.prepare("INSERT INTO students (name) VALUES ('student1')").run();
  }
};
