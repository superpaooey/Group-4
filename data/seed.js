import pool from '../src/config/database.js';

export const seedDefaultStudent = async () => {
  const result = await pool.query('SELECT * FROM students LIMIT 1');

  if (result.rowCount === 0) {
    await pool.query("INSERT INTO students (name) VALUES ('student1')");
  }
};

export default { seedDefaultStudent };
