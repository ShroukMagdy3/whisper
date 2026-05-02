import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function signup(req, res, next) {
  try {
    const { username, email, password, displayName } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, email, passwordHash, displayName });

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toJSON() });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: user.toJSON() });

  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {

  return res.status(200).json(req.user);
}
