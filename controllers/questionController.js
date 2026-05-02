import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/errorHandler.js';
async function getOwnedQuestion(id, userId) {
  const question = await Question.findById(id);
  if (!question) throw new HttpError(404, 'Question not found');
  if (question.recipient.toString() !== userId.toString())
    throw new HttpError(403, 'Forbidden');
  return question;
}



export async function sendQuestion(req, res, next) {
  try {
    const recipient = await User.findOne({ username: req.params.username });
    if (!recipient)            throw new HttpError(404, 'User not found');
    if (!recipient.acceptingQuestions) throw new HttpError(403, 'User is not accepting questions');

    const question = await Question.create({
      recipient: recipient._id,
      body: req.body.body,
    });

    const { recipient: _, ...safe } = question.toObject();
    return res.status(201).json(safe);

  } catch (err) { next(err); }
}

export async function listInbox(req, res, next) {
  try {
    const VALID_STATUSES = ['pending', 'answered', 'ignored'];
    const filter = { recipient: req.user._id };

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status))
        throw new HttpError(400, 'Invalid status');
      filter.status = req.query.status;
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    return res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });

  } catch (err) { next(err); }
}

export async function answerQuestion(req, res, next) {
  try {
    const question = await getOwnedQuestion(req.params.id, req.user._id);

    question.answer     = req.body.answer;
    question.answeredAt = new Date();
    question.status     = 'answered';
    if (req.body.visibility) question.visibility = req.body.visibility;

    await question.save();
    return res.json(question);

  } catch (err) { next(err); }
}

export async function updateQuestion(req, res, next) {
  try {
    const question = await getOwnedQuestion(req.params.id, req.user._id);

    const { answer, status, visibility } = req.body;
    if (answer !== undefined) {
      question.answer     = answer;
      question.answeredAt = new Date();
      question.status     = 'answered';       
    }
    if (status     !== undefined) question.status     = status;
    if (visibility !== undefined) question.visibility = visibility;

    await question.save();
    return res.json(question);

  } catch (err) { next(err); }
}

export async function removeQuestion(req, res, next) {
  try {
    const question = await getOwnedQuestion(req.params.id, req.user._id);
    await question.deleteOne();
    return res.sendStatus(204);

  } catch (err) { next(err); }
}

export async function listPublicFeed(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) throw new HttpError(404, 'User not found');

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { recipient: user._id, status: 'answered', visibility: 'public' };

    const [data, total] = await Promise.all([
      Question.find(filter, { recipient: 0 })  
        .sort({ answeredAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    return res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });

  } catch (err) { next(err); }
}
