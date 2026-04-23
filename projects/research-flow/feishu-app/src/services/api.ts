import axios from 'axios';
import type {
  Experiment,
  ExperimentListResult,
  CreateExperimentInput,
  UpdateExperimentInput,
  ListExperimentQuery,
  Comment,
  CreateCommentInput,
  Paper,
  CreatePaperInput,
  WeeklyReport,
  DashboardOverview,
  AuthUser,
} from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

let currentUser: AuthUser | null = null;
let authToken: string | null = null;

export function setAuth(token: string, user: AuthUser) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('rf_token', token);
  localStorage.setItem('rf_user', JSON.stringify(user));
}

export function clearAuth() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('rf_token');
  localStorage.removeItem('rf_user');
}

export function getAuthUser(): AuthUser | null {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('rf_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    authToken = localStorage.getItem('rf_token');
  }
  return currentUser;
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  authToken = localStorage.getItem('rf_token');
  return authToken;
}

export function isLoggedIn(): boolean {
  return !!getAuthToken();
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Auth ──

export function getFeishuAuthUrl(redirectUri?: string): Promise<string> {
  return api.get('/auth/feishu/authorize-url', {
    params: { redirect_uri: redirectUri || window.location.origin + '/auth/callback' },
  }).then(res => res.data.url);
}

export async function loginWithFeishu(code: string): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post('/auth/feishu/callback', { code });
  setAuth(data.token, data.user);
  return data;
}

export async function getCurrentUser(): Promise<AuthUser & { lab?: any }> {
  const { data } = await api.get('/auth/me');
  return data;
}

// ── Experiments ──

export async function getExperiments(params: Partial<ListExperimentQuery> = {}): Promise<ExperimentListResult> {
  const { data } = await api.get('/experiments', { params });
  return data;
}

export async function getExperiment(id: string): Promise<Experiment> {
  const { data } = await api.get(`/experiments/${id}`);
  return data;
}

export async function createExperiment(input: CreateExperimentInput): Promise<Experiment> {
  const { data } = await api.post('/experiments', input);
  return data;
}

export async function updateExperiment(id: string, input: UpdateExperimentInput): Promise<Experiment> {
  const { data } = await api.patch(`/experiments/${id}`, input);
  return data;
}

export async function deleteExperiment(id: string): Promise<void> {
  await api.delete(`/experiments/${id}`);
}

// ── Comments ──

export async function getComments(experimentId: string): Promise<Comment[]> {
  const { data } = await api.get(`/comments/${experimentId}`);
  return data;
}

export async function createComment(experimentId: string, input: CreateCommentInput): Promise<Comment> {
  const { data } = await api.post(`/comments/${experimentId}`, input);
  return data;
}

export async function resolveComment(id: string): Promise<Comment> {
  const { data } = await api.patch(`/comments/${id}/resolve`);
  return data;
}

// ── Papers ──

export async function getPapers(params: { labId?: string; authorId?: string } = {}): Promise<Paper[]> {
  const { data } = await api.get('/papers', { params });
  return data;
}

export async function getPaper(id: string): Promise<Paper> {
  const { data } = await api.get(`/papers/${id}`);
  return data;
}

export async function createPaper(input: CreatePaperInput): Promise<Paper> {
  const { data } = await api.post('/papers', input);
  return data;
}

export async function updatePaper(id: string, input: Partial<Paper>): Promise<Paper> {
  const { data } = await api.patch(`/papers/${id}`, input);
  return data;
}

// ── Weekly Reports ──

export async function generateWeeklyReport(input: { labId: string; weekStart: string; weekEnd: string }): Promise<WeeklyReport> {
  const { data } = await api.post('/weekly-reports/generate', input);
  return data;
}

export async function getWeeklyReport(id: string): Promise<WeeklyReport> {
  const { data } = await api.get(`/weekly-reports/${id}`);
  return data;
}

export async function getWeeklyReports(params: { labId: string; page?: number; pageSize?: number }): Promise<{ total: number; page: number; pageSize: number; items: WeeklyReport[] }> {
  const { data } = await api.get('/weekly-reports', { params });
  return data;
}

export async function updateWeeklyReportLine(reportId: string, lineId: string, input: Partial<import('./types').WeeklyReportLine>): Promise<import('./types').WeeklyReportLine> {
  const { data } = await api.patch(`/weekly-reports/${reportId}/lines/${lineId}`, input);
  return data;
}

export async function getWeeklyReportMarkdown(id: string): Promise<string> {
  const { data } = await api.get(`/weekly-reports/${id}/markdown`, { responseType: 'text' });
  return data;
}

// ── Dashboard ──

export async function getDashboardOverview(labId?: string): Promise<DashboardOverview> {
  const { data } = await api.get('/dashboard/overview', { params: { labId } });
  return data;
}

export default api;