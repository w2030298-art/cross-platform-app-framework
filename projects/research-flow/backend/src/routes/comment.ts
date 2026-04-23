import { Router } from 'express';
import { asyncHandler, validateBody, getPrisma, AppError } from '../middleware.js';
import { createCommentSchema } from '../validators.js';
import { PrismaClient } from '@prisma/client';

export const commentRouter = Router();

commentRouter.post(
  '/:experimentId',
  validateBody(createCommentSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const { experimentId } = req.params;
    const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
    if (!experiment) throw new AppError(404, 'Experiment not found');

    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        quote: req.body.quote,
        priority: req.body.priority,
        parentId: req.body.parentId,
        experimentId,
        authorId: req.user!.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    res.status(201).json(comment);
  }),
);

commentRouter.get(
  '/:experimentId',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const comments = await prisma.comment.findMany({
      where: { experimentId: req.params.experimentId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  }),
);

commentRouter.patch(
  '/:id/resolve',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { resolved: true },
    });
    res.json(comment);
  }),
);