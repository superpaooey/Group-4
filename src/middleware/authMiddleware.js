import jwt from 'jsonwebtoken';
import tokenService from '../services/tokenService.js';
import { getUserById } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  const blacklisted = await tokenService.isBlacklisted(token);

  if (blacklisted) {
    return res.status(401).send({ message: 'Token revoked' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.id);

    if (!user) {
      return res.status(401).send({ message: 'Invalid token user' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Invalid token' });
  }
}
