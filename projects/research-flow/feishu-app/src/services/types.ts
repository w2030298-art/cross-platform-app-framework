export type ExperimentType =
  | 'ALGORITHM_VERIFICATION'
  | 'HYPERPARAM_TUNING'
  | 'ABLATION_STUDY'
  | 'REPRODUCTION'
  | 'DATA_COLLECTION'
  | 'OTHER';

export type ExperimentStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export type CommentPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type PaperStatus =
  | 'IDEA' | 'PROPOSAL' | 'EXPERIMENT' | 'DATA_ANALYSIS'
  | 'WRITING' | 'SUBMITTED' | 'REVIEW' | 'REVISION'
  | 'ACCEPTED' | 'PUBLISHED';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export type Role = 'ADVISOR' | 'POSTDOC' | 'PHD' | 'MASTER' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  feishuId: string;
  name: string;
  role: Role;
  avatar?: string;
  email?: string;
  labId?: string;
}

export interface Experiment {
  id: string;
  title: string;
  date: string;
  type: ExperimentType;
  status: ExperimentStatus;
  purpose?: string;
  process?: string;
  result?: string;
  conclusion?: string;
  nextStep?: string;
  tags: string;
  images?: string;
  attachments?: string;
  authorId: string;
  author?: User;
  projectId?: string;
  project?: { id: string; name: string };
  labId: string;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentListResult {
  total: number;
  page: number;
  pageSize: number;
  items: Experiment[];
}

export interface CreateExperimentInput {
  title: string;
  type: ExperimentType;
  date?: string;
  purpose?: string;
  process?: string;
  result?: string;
  conclusion?: string;
  nextStep?: string;
  tags?: string;
  projectId?: string;
}

export type UpdateExperimentInput = Partial<CreateExperimentInput> & { status?: ExperimentStatus };

export interface ListExperimentQuery {
  page: number;
  pageSize: number;
  status?: ExperimentStatus;
  type?: ExperimentType;
  authorId?: string;
  labId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface Comment {
  id: string;
  content: string;
  quote?: string;
  priority: CommentPriority;
  resolved: boolean;
  experimentId: string;
  authorId: string;
  author?: User;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
  quote?: string;
  priority?: CommentPriority;
  parentId?: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract?: string;
  keywords: string;
  venue?: string;
  authorId: string;
  author?: User;
  projectId?: string;
  labId: string;
  status: PaperStatus;
  milestones?: PaperMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaperInput {
  title: string;
  abstract?: string;
  keywords?: string[];
  venue?: string;
  projectId?: string;
  status?: PaperStatus;
}

export interface PaperMilestone {
  id: string;
  paperId: string;
  stage: PaperStatus;
  plannedDate: string;
  actualDate?: string;
  status: MilestoneStatus;
  note?: string;
}

export interface WeeklyReport {
  id: string;
  labId: string;
  weekStart: string;
  weekEnd: string;
  meetingDate?: string;
  meetingUrl?: string;
  meetingNotes?: string;
  status: 'DRAFT' | 'READY' | 'COMPLETED';
  feishuDocId?: string;
  lines: WeeklyReportLine[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReportLine {
  id: string;
  reportId: string;
  userId: string;
  user?: User;
  experimentsCompleted: number;
  experimentsInProgress: number;
  experimentsFailed: number;
  keyFindings?: string;
  problems?: string;
  nextWeekPlan?: string;
  actionItems?: string;
  experimentIds: string;
}

export interface AuthUser {
  id: string;
  feishuOpenId: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  role: string;
  labId?: string;
}

export interface DashboardOverview {
  weekSummary: {
    completed: number;
    inProgress: number;
    failed: number;
    totalExperiments: number;
    pendingComments: number;
  };
  memberProgress: Array<User & {
    experimentsThisWeek: number;
    completedThisWeek: number;
  }>;
  papers: Paper[];
}

export interface Equipment {
  id: string;
  name: string;
  model?: string;
  location?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
  description?: string;
  labId: string;
  bookings: EquipmentBooking[];
}

export interface EquipmentBooking {
  id: string;
  equipmentId: string;
  userId: string;
  user?: User;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: BookingStatus;
  approvalId?: string;
}

export const EXPERIMENT_TYPE_LABELS: Record<ExperimentType, string> = {
  ALGORITHM_VERIFICATION: '算法验证',
  HYPERPARAM_TUNING: '超参调优',
  ABLATION_STUDY: '消融实验',
  REPRODUCTION: '复现实验',
  DATA_COLLECTION: '数据采集',
  OTHER: '其他',
};

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  FAILED: '失败',
  PAUSED: '暂停',
};

export const PAPER_STATUS_LABELS: Record<PaperStatus, string> = {
  IDEA: '选题',
  PROPOSAL: '开题',
  EXPERIMENT: '实验中',
  DATA_ANALYSIS: '数据分析',
  WRITING: '写作中',
  SUBMITTED: '已投稿',
  REVIEW: '审稿中',
  REVISION: '修改中',
  ACCEPTED: '已接受',
  PUBLISHED: '已发表',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADVISOR: '导师',
  POSTDOC: '博后',
  PHD: '博士生',
  MASTER: '硕士生',
  ADMIN: '管理员',
};

export function parseJsonField<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function formatTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return parseJsonField(tags, []);
}