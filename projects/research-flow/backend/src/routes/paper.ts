import { Router } from 'express';
import { asyncHandler, validateBody, getPrisma, AppError } from '../middleware.js';
import { createPaperSchema, createMilestoneSchema } from '../validators.js';
import { stringifyJsonField } from '../middleware/json-parser.js';
import { PrismaClient } from '@prisma/client';

export const paperRouter = Router();

paperRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const { labId, authorId, status } = req.query;
    const where: any = {};
    if (labId) where.labId = labId as string;
    if (authorId) where.authorId = authorId as string;
    if (status) where.status = status as string;

    const papers = await prisma.paper.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        milestones: { orderBy: { plannedDate: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(papers);
  }),
);

paperRouter.post(
  '/',
  validateBody(createPaperSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const paper = await prisma.paper.create({
      data: {
        title: req.body.title,
        abstract_: req.body.abstract,
        keywords: stringifyJsonField(req.body.keywords),
        venue: req.body.venue,
        projectId: req.body.projectId,
        authorId: req.user!.id,
        labId: req.user!.labId!,
      },
      include: { milestones: true },
    });
    res.status(201).json(paper);
  }),
);

paperRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const paper = await prisma.paper.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        milestones: { orderBy: { plannedDate: 'asc' } },
      },
    });
    if (!paper) throw new AppError(404, 'Paper not found');
    res.json(paper);
  }),
);

paperRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const paper = await prisma.paper.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(paper);
  }),
);

paperRouter.post(
  '/:id/milestones',
  validateBody(createMilestoneSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const paper = await prisma.paper.findUnique({ where: { id: req.params.id } });
    if (!paper) throw new AppError(404, 'Paper not found');

    const milestone = await prisma.paperMilestone.create({
      data: {
        ...req.body,
        paperId: req.params.id,
      },
    });
    res.status(201).json(milestone);
  }),
);

paperRouter.patch(
  '/:id/milestones/:milestoneId',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const milestone = await prisma.paperMilestone.update({
      where: { id: req.params.milestoneId },
      data: {
        ...(req.body.actualDate && { actualDate: new Date(req.body.actualDate) }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.note !== undefined && { note: req.body.note }),
      },
    });
    res.json(milestone);
  }),
);