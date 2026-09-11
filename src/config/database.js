import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'group4',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '100719',
  ssl: false,
});

export default pool;

export const ensureDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);

    const result = await client.query('SELECT * FROM students LIMIT 1');

    if (result.rowCount === 0) {
      await client.query("INSERT INTO students (name) VALUES ('student1')");
    }
  } finally {
    client.release();
  }
};
