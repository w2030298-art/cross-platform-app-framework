import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, validateBody, validateQuery, getPrisma, AppError } from '../middleware.js';
import { createExperimentSchema, updateExperimentSchema, listExperimentQuerySchema } from '../validators.js';
import { ExperimentService } from '../services/experiment.service.js';

export const experimentRouter = Router();

experimentRouter.get(
  '/',
  validateQuery(listExperimentQuerySchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new ExperimentService(prisma);
    const result = await service.list(req.query as any);
    res.json(result);
  }),
);

experimentRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new ExperimentService(prisma);
    const experiment = await service.findById(req.params.id);
    if (!experiment) throw new AppError(404, 'Experiment not found');
    res.json(experiment);
  }),
);

experimentRouter.post(
  '/',
  validateBody(createExperimentSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new ExperimentService(prisma);
    const user = req.user!;
    const experiment = await service.create({
      ...req.body,
      authorId: user.id,
      labId: user.labId!,
    });
    res.status(201).json(experiment);
  }),
);

experimentRouter.patch(
  '/:id',
  validateBody(updateExperimentSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new ExperimentService(prisma);
    const experiment = await service.update(req.params.id, req.body);
    res.json(experiment);
  }),
);

experimentRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const service = new ExperimentService(prisma);
    await service.delete(req.params.id);
    res.status(204).end();
  }),
);