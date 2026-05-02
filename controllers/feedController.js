import { Question } from '../models/Question.js';
import { User } from '../models/User.js';

export async function listGlobalFeed(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { status: 'answered', visibility: 'public' };

    if (req.query.tag) {
      const ids = await User.find({ tags: req.query.tag }).distinct('_id');
      if (ids.length === 0) {
        return res.json({ data: [], page, limit, total: 0, totalPages: 0 });
      }
      filter.recipient = { $in: ids };
    }

    const [data, total] = await Promise.all([
      Question.find(filter)
        .populate('recipient', 'username displayName avatarUrl tags')
        .sort({ answeredAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments(filter),
    ]);

    return res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    next(err);
  }
}
