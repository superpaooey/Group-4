import pool, { ensureDatabase } from '../config/database.js';

await ensureDatabase();

const getStudentRowByIndex = async (index) => {
  const result = await pool.query(
    'SELECT id, name FROM students ORDER BY id LIMIT 1 OFFSET $1',
    [index]
  );

  return result.rows[0] ?? null;
};

export const getAllStudents = async () => {
  const result = await pool.query('SELECT name FROM students ORDER BY id ASC');
  return result.rows.map((row) => ({ name: row.name }));
};

export const addStudent = async (student) => {
  const studentName = student?.name ?? '';
  const result = await pool.query(
    'INSERT INTO students (name) VALUES ($1) RETURNING name',
    [studentName]
  );

  return { name: result.rows[0].name };
};

export const updateStudentAtIndex = async (index, updates) => {
  const row = await getStudentRowByIndex(index);

  if (!row) {
    return null;
  }

  const studentName = updates?.name ?? row.name;
  const result = await pool.query(
    'UPDATE students SET name = $1 WHERE id = $2 RETURNING name',
    [studentName, row.id]
  );

  return { name: result.rows[0].name };
};

export const deleteStudentAtIndex = async (index) => {
  const row = await getStudentRowByIndex(index);

  if (!row) {
    return null;
  }

  await pool.query('DELETE FROM students WHERE id = $1', [row.id]);
  return { name: row.name };
};

export const clearStudents = async () => {
  await pool.query('DELETE FROM students');
};

export const studentCount = async () => {
  const result = await pool.query('SELECT COUNT(*) AS count FROM students');
  return Number(result.rows[0].count);
};

export const getStudentByIndex = async (index) => {
  const row = await getStudentRowByIndex(index);

  if (!row) {
    return undefined;
  }

  return { name: row.name };
};
