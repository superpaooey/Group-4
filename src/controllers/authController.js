import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../models/userModel.js';
import tokenService from '../services/tokenService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 7);

export const register = async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).send({ message: 'Name, email and password are required' });
  }

  const existing = await getUserByEmail(email.toLowerCase());

  if (existing) {
    return res.status(409).send({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email: email.toLowerCase(), passwordHash });

  res.status(201).send({ id: user.id, name: user.name, email: user.email });
};

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const user = await getUserByEmail(email.toLowerCase());

  if (!user) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: `${REFRESH_EXPIRES_DAYS}d` });
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await tokenService.storeRefreshToken({ userId: user.id, token: refreshToken, expiresAt });

  res.send({ token, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
};

export const logout = async (req, res) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(400).send({ message: 'Missing token' });
  }

  const token = auth.split(' ')[1];
  await tokenService.addToBlacklist(token);

  const { refreshToken } = req.body ?? {};
  if (refreshToken) {
    await tokenService.removeRefreshToken(refreshToken);
  }

  res.send({ message: 'Logged out' });
};

export const signup = register;
export const signin = login;
export const signout = logout;

export const refresh = async (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) return res.status(400).send({ message: 'Missing refresh token' });

  const stored = await tokenService.getRefreshToken(refreshToken);

  if (!stored) return res.status(401).send({ message: 'Invalid refresh token' });

  if (new Date(stored.expires_at) < new Date()) {
    await tokenService.removeRefreshToken(refreshToken);
    return res.status(401).send({ message: 'Expired refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const accessToken = jwt.sign({ id: payload.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.send({ token: accessToken });
  } catch (err) {
    return res.status(401).send({ message: 'Invalid refresh token' });
  }
};

export default { register, signup, login, signin, logout, signout, refresh };
