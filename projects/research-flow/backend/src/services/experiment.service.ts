import { PrismaClient } from '@prisma/client';
import { ExperimentStatus } from '@prisma/client';
import { stringifyJsonField } from '../middleware/json-parser.js';
import dayjs from 'dayjs';

export class ExperimentService {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    title: string;
    type: string;
    purpose?: string;
    process?: string;
    result?: string;
    conclusion?: string;
    nextStep?: string;
    tags?: string[];
    projectId?: string;
    authorId: string;
    labId: string;
    date?: Date;
  }) {
    return this.prisma.experiment.create({
      data: {
        title: data.title,
        type: data.type as any,
        purpose: data.purpose,
        process: data.process,
        result: data.result,
        conclusion: data.conclusion,
        nextStep: data.nextStep,
        tags: stringifyJsonField(data.tags),
        date: data.date ?? new Date(),
        authorId: data.authorId,
        labId: data.labId,
        projectId: data.projectId,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.experiment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async list(params: {
    page: number;
    pageSize: number;
    status?: string;
    type?: string;
    authorId?: string;
    labId?: string;
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.authorId) where.authorId = params.authorId;
    if (params.labId) where.labId = params.labId;
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { purpose: { contains: params.keyword } },
        { conclusion: { contains: params.keyword } },
      ];
    }
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    const [total, items] = await Promise.all([
      this.prisma.experiment.count({ where }),
      this.prisma.experiment.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
    ]);

    return { total, page: params.page, pageSize: params.pageSize, items };
  }

  async update(id: string, data: {
    title?: string;
    type?: string;
    status?: string;
    purpose?: string;
    process?: string;
    result?: string;
    conclusion?: string;
    nextStep?: string;
    tags?: string[];
    projectId?: string;
  }) {
    return this.prisma.experiment.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type as any }),
        ...(data.status && { status: data.status as any }),
        ...(data.purpose !== undefined && { purpose: data.purpose }),
        ...(data.process !== undefined && { process: data.process }),
        ...(data.result !== undefined && { result: data.result }),
        ...(data.conclusion !== undefined && { conclusion: data.conclusion }),
        ...(data.nextStep !== undefined && { nextStep: data.nextStep }),
        ...(data.tags && { tags: stringifyJsonField(data.tags) }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.experiment.delete({ where: { id } });
  }

  async getWeeklyStats(authorId: string, weekStart: Date, weekEnd: Date) {
    const experiments = await this.prisma.experiment.findMany({
      where: {
        authorId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: {
        id: true,
        title: true,
        status: true,
        conclusion: true,
        type: true,
      },
    });

    const completed = experiments.filter(e => e.status === ExperimentStatus.COMPLETED);
    const inProgress = experiments.filter(e => e.status === ExperimentStatus.IN_PROGRESS);
    const failed = experiments.filter(e => e.status === ExperimentStatus.FAILED);

    const keyFindings = completed
      .filter(e => e.conclusion)
      .map(e => `- ${e.title}: ${e.conclusion}`)
      .join('\n');

    const problems = failed
      .map(e => `- ${e.title}`)
      .join('\n');

    return {
      total: experiments.length,
      completedCount: completed.length,
      inProgressCount: inProgress.length,
      failedCount: failed.length,
      experiments,
      keyFindings,
      problems,
      experimentIds: experiments.map(e => e.id),
    };
  }
}