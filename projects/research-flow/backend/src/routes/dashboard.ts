import { Router } from 'express';
import { asyncHandler, getPrisma, AppError } from '../middleware.js';
import { PrismaClient } from '@prisma/client';
import { ExperimentStatus } from '@prisma/client';
import dayjs from 'dayjs';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const user = req.user!;
    const labId = req.query.labId as string || user.labId;
    if (!labId) throw new AppError(400, 'labId required');

    const now = dayjs();
    const weekStart = now.startOf('week').toDate();
    const weekEnd = now.endOf('week').toDate();

    const [
      totalExperiments,
      completedThisWeek,
      inProgressThisWeek,
      failedThisWeek,
      pendingComments,
      members,
      papers,
    ] = await Promise.all([
      prisma.experiment.count({ where: { labId } }),
      prisma.experiment.count({
        where: { labId, status: ExperimentStatus.COMPLETED, date: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.experiment.count({
        where: { labId, status: ExperimentStatus.IN_PROGRESS, date: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.experiment.count({
        where: { labId, status: ExperimentStatus.FAILED, date: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.comment.count({
        where: { resolved: false, experiment: { labId } },
      }),
      prisma.user.findMany({
        where: { labId },
        select: { id: true, name: true, avatar: true, role: true },
      }),
      prisma.paper.findMany({
        where: { labId },
        select: {
          id: true, title: true, status: true,
          author: { select: { id: true, name: true } },
          milestones: { orderBy: { plannedDate: 'desc' }, take: 1 },
        },
      }),
    ]);

    const memberProgress = await Promise.all(
      members.map(async (m) => {
        const expCount = await prisma.experiment.count({
          where: { authorId: m.id, date: { gte: weekStart, lte: weekEnd } },
        });
        const completed = await prisma.experiment.count({
          where: { authorId: m.id, status: ExperimentStatus.COMPLETED, date: { gte: weekStart, lte: weekEnd } },
        });
        return { ...m, experimentsThisWeek: expCount, completedThisWeek: completed };
      }),
    );

    res.json({
      weekSummary: {
        completed: completedThisWeek,
        inProgress: inProgressThisWeek,
        failed: failedThisWeek,
        totalExperiments,
        pendingComments,
      },
      memberProgress,
      papers,
    });
  }),
);