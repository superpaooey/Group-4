import { addBlacklistedToken, isTokenBlacklisted, saveRefreshToken, findRefreshToken, deleteRefreshToken } from '../models/tokenModel.js';

export const addToBlacklist = async (token, expiresAt = null) => {
  await addBlacklistedToken({ token, expiresAt });
};

export const isBlacklisted = async (token) => {
  return await isTokenBlacklisted(token);
};

export const storeRefreshToken = async ({ userId, token, expiresAt }) => {
  return await saveRefreshToken({ userId, token, expiresAt });
};

export const getRefreshToken = async (token) => {
  return await findRefreshToken(token);
};

export const removeRefreshToken = async (token) => {
  return await deleteRefreshToken(token);
};

export default { addToBlacklist, isBlacklisted, storeRefreshToken, getRefreshToken, removeRefreshToken };
