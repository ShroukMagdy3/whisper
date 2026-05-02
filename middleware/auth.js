import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from './errorHandler.js';


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      throw new HttpError(401, 'Missing or malformed token');

    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.sub)
    if (!user) throw new HttpError(401, 'User no longer exists');

    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
      return next(new HttpError(401, err.message));
    next(err);
  }
}
