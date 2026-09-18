import pool from '../config/database.js';

export const saveRefreshToken = async ({ userId, token, expiresAt }) => {
  const result = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id, user_id, token, expires_at, created_at',
    [userId, token, expiresAt]
  );

  return result.rows[0];
};

export const findRefreshToken = async (token) => {
  const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  return result.rows[0] ?? null;
};

export const deleteRefreshToken = async (token) => {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

export const addBlacklistedToken = async ({ token, expiresAt = null }) => {
  await pool.query('INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)', [token, expiresAt]);
};

export const isTokenBlacklisted = async (token) => {
  const result = await pool.query('SELECT id FROM token_blacklist WHERE token = $1 LIMIT 1', [token]);
  return result.rowCount > 0;
};
