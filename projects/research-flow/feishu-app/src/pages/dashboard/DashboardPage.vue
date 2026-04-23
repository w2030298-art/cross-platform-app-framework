<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h2>导师看板</h2>
      <button class="btn btn-primary" @click="refresh">刷新</button>
    </div>

    <div v-if="loading" class="empty-state">
      <div class="empty-state-icon">⏳</div>
      <div class="empty-state-text">加载中...</div>
    </div>

    <template v-else-if="overview">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ overview.weekSummary.completed }}</div>
          <div class="stat-label">本周完成 ✅</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overview.weekSummary.inProgress }}</div>
          <div class="stat-label">进行中 🔄</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overview.weekSummary.failed }}</div>
          <div class="stat-label">失败 ❌</div>
        </div>
        <div class="stat-card stat-card--warning">
          <div class="stat-value">{{ overview.weekSummary.pendingComments }}</div>
          <div class="stat-label">待批注 📝</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">学生进度</h3>
        <div class="member-table-wrapper">
          <table class="member-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>角色</th>
                <th>本周实验</th>
                <th>完成数</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in overview.memberProgress" :key="m.id">
                <td>
                  <div class="member-name">
                    <div class="member-avatar">{{ m.name?.[0] || '?' }}</div>
                    {{ m.name }}
                  </div>
                </td>
                <td>{{ ROLE_LABELS[m.role] || m.role }}</td>
                <td>{{ m.experimentsThisWeek }}</td>
                <td>{{ m.completedThisWeek }}</td>
                <td>
                  <span :class="getStatusClass(m)">{{ getStatusText(m) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">论文进度</h3>
        <div class="paper-list">
          <div v-for="p in overview.papers" :key="p.id" class="paper-item card">
            <div class="paper-title">{{ p.title }}</div>
            <div class="paper-meta">
              {{ p.author?.name }} · {{ PAPER_STATUS_LABELS[p.status] }}
            </div>
            <div class="paper-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getPaperProgress(p.status) + '%' }"></div>
              </div>
              <span class="progress-text">{{ getPaperProgress(p.status) }}%</span>
            </div>
          </div>
          <div v-if="!overview.papers?.length" class="empty-state">
            <div class="empty-state-text">暂无论文</div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div class="empty-state-text">暂无数据，请先加入课题组</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDashboardStore } from '@/stores';
import { ROLE_LABELS, PAPER_STATUS_LABELS } from '@/services/types';
import type { Paper, PaperStatus } from '@/services/types';

const dashboard = useDashboardStore();
const overview = ref<any>(null);
const loading = ref(false);

async function refresh() {
  loading.value = true;
  try {
    await dashboard.fetchOverview();
    overview.value = dashboard.overview;
  } finally {
    loading.value = false;
  }
}

onMounted(refresh);

function getStatusClass(m: any) {
  if (m.completedThisWeek >= 2) return 'tag tag-success';
  if (m.experimentsThisWeek > 0) return 'tag tag-warning';
  return 'tag tag-danger';
}

function getStatusText(m: any) {
  if (m.completedThisWeek >= 2) return '良好';
  if (m.experimentsThisWeek > 0) return '正常';
  return '需关注';
}

function getPaperProgress(status: PaperStatus): number {
  const map: Record<PaperStatus, number> = {
    IDEA: 5, PROPOSAL: 15, EXPERIMENT: 30, DATA_ANALYSIS: 45,
    WRITING: 60, SUBMITTED: 70, REVIEW: 80, REVISION: 85,
    ACCEPTED: 95, PUBLISHED: 100,
  };
  return map[status] ?? 0;
}
</script>

<style scoped>
.dashboard-page {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-1);
  border-radius: var(--radius-md);
  padding: 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-card--warning {
  border-left: 3px solid var(--color-warning);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-1);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.member-table-wrapper {
  overflow-x: auto;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.member-table th,
.member-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid var(--color-border-light);
}

.member-table th {
  background: var(--color-bg-3);
  color: var(--color-text-3);
  font-weight: 500;
  font-size: 13px;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.paper-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.paper-item {
  padding: 12px 16px;
}

.paper-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.paper-meta {
  font-size: 13px;
  color: var(--color-text-3);
  margin-bottom: 8px;
}

.paper-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--color-text-3);
  min-width: 36px;
}
</style>