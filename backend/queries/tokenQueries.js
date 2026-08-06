const pool = require('../db');

// ---- Password Resets (passwordresets collection) ----

async function createPasswordReset(userId, userType, token, expiresAt) {
  await pool.query(
    'DELETE FROM password_resets WHERE user_id = ? AND user_type = ?',
    [userId, userType]
  );
  await pool.query(
    'INSERT INTO password_resets (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)',
    [userId, userType, token, expiresAt]
  );
}

async function findPasswordReset(token) {
  const [rows] = await pool.query(
    'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW() LIMIT 1',
    [token]
  );
  return rows[0] || null;
}

async function markPasswordResetUsed(token) {
  await pool.query('UPDATE password_resets SET used = 1 WHERE token = ?', [token]);
}

async function deletePasswordReset(token) {
  await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);
}

async function deleteExpiredPasswordResets() {
  await pool.query('DELETE FROM password_resets WHERE expires_at < NOW() OR used = 1');
}

// ---- Refresh Tokens (refreshtokens collection) ----

async function createRefreshToken(userId, userType, token, expiresAt) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)',
    [userId, userType, token, expiresAt]
  );
}

async function findRefreshToken(token) {
  const [rows] = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1',
    [token]
  );
  return rows[0] || null;
}

async function deleteRefreshToken(token) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

async function deleteUserRefreshTokens(userId, userType) {
  await pool.query(
    'DELETE FROM refresh_tokens WHERE user_id = ? AND user_type = ?',
    [userId, userType]
  );
}

async function deleteExpiredRefreshTokens() {
  await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
}

module.exports = {
  createPasswordReset, findPasswordReset, markPasswordResetUsed, deletePasswordReset, deleteExpiredPasswordResets,
  createRefreshToken, findRefreshToken, deleteRefreshToken, deleteUserRefreshTokens, deleteExpiredRefreshTokens,
};
