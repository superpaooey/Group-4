import pool, { ensureDatabase } from '../config/database.js';

await ensureDatabase();

export const getAllStudents = async () => {
  const result = await pool.query('SELECT id, name FROM students ORDER BY id ASC');
  return result.rows.map((row) => ({ id: Number(row.id), name: row.name }));
};

export const addStudent = async (student) => {
  const studentName = student?.name ?? '';
  const result = await pool.query(
    'INSERT INTO students (name) VALUES ($1) RETURNING id, name',
    [studentName]
  );

  return { id: Number(result.rows[0].id), name: result.rows[0].name };
};

export const updateStudentById = async (id, updates) => {
  const result = await pool.query(
    'UPDATE students SET name = $1 WHERE id = $2 RETURNING id, name',
    [updates.name, id]
  );

  const row = result.rows[0];
  return row ? { id: Number(row.id), name: row.name } : null;
};

export const deleteStudentById = async (id) => {
  const result = await pool.query(
    'DELETE FROM students WHERE id = $1 RETURNING id, name',
    [id]
  );

  const row = result.rows[0];
  return row ? { id: Number(row.id), name: row.name } : null;
};

export const clearStudents = async () => {
  await pool.query('DELETE FROM students');
};

export const getStudentById = async (id) => {
  const result = await pool.query('SELECT id, name FROM students WHERE id = $1', [id]);
  const row = result.rows[0];
  return row ? { id: Number(row.id), name: row.name } : null;
};
