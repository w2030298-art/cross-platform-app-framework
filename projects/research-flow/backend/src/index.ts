import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { experimentRouter } from './routes/experiment.js';
import { commentRouter } from './routes/comment.js';
import { paperRouter } from './routes/paper.js';
import { weeklyReportRouter } from './routes/weekly-report.js';
import { dashboardRouter } from './routes/dashboard.js';
import { equipmentRouter } from './routes/equipment.js';
import { authRouter } from './routes/auth.js';
import { optionalAuth, errorHandler } from './middleware.js';
import { jsonFieldParser } from './middleware/json-parser.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Auto-parse JSON string fields (tags, keywords, etc.) to arrays in API responses
app.use(jsonFieldParser);

app.set('prisma', prisma);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required)
app.use('/api/auth', authRouter);

// Protected routes (flexible auth: JWT, dev mock token, or header-based dev auth)
app.use('/api/experiments', optionalAuth, experimentRouter);
app.use('/api/comments', optionalAuth, commentRouter);
app.use('/api/papers', optionalAuth, paperRouter);
app.use('/api/weekly-reports', optionalAuth, weeklyReportRouter);
app.use('/api/dashboard', optionalAuth, dashboardRouter);
app.use('/api/equipment', optionalAuth, equipmentRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ResearchFlow API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };