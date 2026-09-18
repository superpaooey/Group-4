export const validateRegisterInput = ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Name is required.';
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'Email is required.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  return null;
};

export const validateLoginInput = ({ email, password }) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'Email is required.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  return null;
};

export const validateRefreshTokenInput = ({ refreshToken }) => {
  if (!refreshToken || typeof refreshToken !== 'string' || !refreshToken.trim()) {
    return 'Refresh token is required.';
  }

  return null;
};

export default {
  validateRegisterInput,
  validateLoginInput,
  validateRefreshTokenInput,
};
