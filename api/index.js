import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connectDB } from '../config/db.js';
import { notFound } from '../middleware/notFound.js';
import { errorHandler } from '../middleware/errorHandler.js';
import authRoutes from '../routes/authRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import questionRoutes from '../routes/questionRoutes.js';
import feedRoutes from '../routes/feedRoutes.js';

const app = express();

// Ensure DB connection
await connectDB();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/feed', feedRoutes);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, '../public')));

app.use(notFound);
app.use(errorHandler);

export default app;
