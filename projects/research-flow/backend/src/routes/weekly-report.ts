import { Router } from 'express';
import { asyncHandler, validateBody, getPrisma } from '../middleware.js';
import { generateWeeklyReportSchema } from '../validators.js';
import { WeeklyReportService } from '../services/weekly-report.service.js';

export const weeklyReportRouter = Router();

weeklyReportRouter.post(
  '/generate',
  validateBody(generateWeeklyReportSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new WeeklyReportService(prisma);
    const report = await service.generate(req.body);
    res.status(201).json(report);
  }),
);

weeklyReportRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new WeeklyReportService(prisma);
    const report = await service.findById(req.params.id);
    res.json(report);
  }),
);

weeklyReportRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new WeeklyReportService(prisma);
    const { labId, page, pageSize } = req.query as any;
    const result = await service.findByLab(labId, page ?? 1, pageSize ?? 10);
    res.json(result);
  }),
);

weeklyReportRouter.patch(
  '/:reportId/lines/:lineId',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new WeeklyReportService(prisma);
    const line = await service.updateLine(req.params.lineId, req.body);
    res.json(line);
  }),
);

weeklyReportRouter.get(
  '/:id/markdown',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new WeeklyReportService(prisma);
    const md = await service.generateMarkdown(req.params.id);
    res.type('text/markdown').send(md);
  }),
);