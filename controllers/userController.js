import { User } from '../models/User.js';
import { HttpError } from '../middleware/errorHandler.js';

const PUBLIC_PROFILE_EXCLUDE  = '-email -passwordHash';


export async function getPublicProfile(req, res, next) {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      PUBLIC_PROFILE_EXCLUDE
    );
    if (!user) throw new HttpError(404, 'User not found');
    return res.json(user);

  } catch (err) { next(err); }
}

const ALLOWED_UPDATE_FIELDS = ['displayName', 'bio', 'avatarUrl', 'acceptingQuestions', 'tags'];

export async function updateMe(req, res, next) {
  try {
    const update = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      acceptingQuestions: user.acceptingQuestions,
      tags: user.tags,
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return next({ status: 400, message: err.message });
    }
    next(err);
  }
}