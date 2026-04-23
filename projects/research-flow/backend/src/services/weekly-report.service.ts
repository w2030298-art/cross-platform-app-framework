import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { stringifyJsonField } from '../middleware/json-parser.js';
dayjs.extend(isoWeek);
import { ExperimentService } from './experiment.service.js';

export class WeeklyReportService {
  constructor(private prisma: PrismaClient) {}

  async generate(data: {
    labId: string;
    weekStart: Date;
    weekEnd: Date;
  }) {
    const lab = await this.prisma.lab.findUnique({
      where: { id: data.labId },
      include: { members: true },
    });
    if (!lab) throw new Error('Lab not found');

    const experimentService = new ExperimentService(this.prisma);
    const lines = [];

    for (const member of lab.members) {
      const stats = await experimentService.getWeeklyStats(
        member.id,
        data.weekStart,
        data.weekEnd,
      );
      lines.push({
        userId: member.id,
        experimentsCompleted: stats.completedCount,
        experimentsInProgress: stats.inProgressCount,
        experimentsFailed: stats.failedCount,
        keyFindings: stats.keyFindings || null,
        problems: stats.problems || null,
        nextWeekPlan: null,
        actionItems: null,
        experimentIds: stringifyJsonField(stats.experimentIds),
      });
    }

    const report = await this.prisma.weeklyReport.create({
      data: {
        labId: data.labId,
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        status: 'DRAFT',
        lines: {
          create: lines,
        },
      },
      include: {
        lines: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    });

    return report;
  }

  async findById(id: string) {
    return this.prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        lines: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    });
  }

  async findByLab(labId: string, page = 1, pageSize = 10) {
    const [total, items] = await Promise.all([
      this.prisma.weeklyReport.count({ where: { labId } }),
      this.prisma.weeklyReport.findMany({
        where: { labId },
        orderBy: { weekStart: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          lines: { include: { user: { select: { id: true, name: true } } } },
        },
      }),
    ]);
    return { total, page, pageSize, items };
  }

  async updateLine(lineId: string, data: {
    keyFindings?: string;
    problems?: string;
    nextWeekPlan?: string;
    actionItems?: string;
  }) {
    return this.prisma.weeklyReportLine.update({
      where: { id: lineId },
      data,
    });
  }

  async generateMarkdown(reportId: string) {
    const report = await this.findById(reportId);
    if (!report) throw new Error('Report not found');

    const weekNum = dayjs(report.weekStart).isoWeek();
    const lines = report.lines.map(l => {
      const userName = l.user?.name ?? 'Unknown';
      let md = `### ${userName}\n\n`;
      md += `- 完成实验: ${l.experimentsCompleted} ✅\n`;
      md += `- 进行中: ${l.experimentsInProgress} 🔄\n`;
      md += `- 失败/暂停: ${l.experimentsFailed} ❌\n\n`;
      if (l.keyFindings) md += `**重要发现:**\n${l.keyFindings}\n\n`;
      if (l.problems) md += `**问题与讨论:**\n${l.problems}\n\n`;
      if (l.nextWeekPlan) md += `**下周计划:**\n${l.nextWeekPlan}\n\n`;
      if (l.actionItems) md += `**行动项:**\n${l.actionItems}\n\n`;
      return md;
    }).join('---\n');

    return `# 第${weekNum}周组会汇报\n\n> ${dayjs(report.weekStart).format('YYYY-MM-DD')} ~ ${dayjs(report.weekEnd).format('YYYY-MM-DD')}\n\n${lines}`;
  }
}