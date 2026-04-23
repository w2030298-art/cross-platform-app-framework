<template>
  <div class="meeting-page">
    <div class="page-header">
      <h2>组会管理</h2>
      <button class="btn btn-primary" @click="generateReport" :disabled="generating">
        {{ generating ? '生成中...' : '生成本周汇报' }}
      </button>
    </div>

    <div class="tabs">
      <button :class="['tab', activeTab === 'reports' ? 'tab-active' : '']" @click="activeTab = 'reports'">周报列表</button>
      <button :class="['tab', activeTab === 'schedule' ? 'tab-active' : '']" @click="activeTab = 'schedule'">组会日程</button>
    </div>

    <div v-if="activeTab === 'reports'">
      <div v-if="reports.length" class="report-list">
        <div v-for="report in reports" :key="report.id" class="report-card card" @click="viewReport(report.id)">
          <div class="report-header">
            <h3>第{{ getWeekNumber(report.weekStart) }}周组会汇报</h3>
            <span :class="getReportStatusClass(report.status)">{{ REPORT_STATUS[report.status] }}</span>
          </div>
          <div class="report-date">
            {{ formatDate(report.weekStart) }} ~ {{ formatDate(report.weekEnd) }}
          </div>
          <div v-if="report.lines?.length" class="report-summary">
            {{ report.lines.length }} 位同学已提交
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">暂无周报，点击右上角生成</div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">🗓️</div>
      <div class="empty-state-text">组会日程将同步飞书日历（开发中）</div>
    </div>

    <div v-if="currentReport" class="modal-overlay" @click.self="currentReport = null">
      <div class="modal card">
        <div class="modal-header">
          <h3>周报详情</h3>
          <button class="btn btn-secondary btn-sm" @click="exportMarkdown">导出 Markdown</button>
        </div>
        <div v-if="currentReport.lines?.length" class="report-lines">
          <div v-for="line in currentReport.lines" :key="line.id" class="report-line">
            <h4>{{ line.user?.name }}</h4>
            <div class="line-stats">
              <span class="tag tag-success">完成 {{ line.experimentsCompleted }}</span>
              <span class="tag tag-info">进行中 {{ line.experimentsInProgress }}</span>
              <span class="tag tag-danger">失败 {{ line.experimentsFailed }}</span>
            </div>
            <div v-if="line.keyFindings" class="line-section">
              <strong>重要发现:</strong>
              <pre class="line-content">{{ line.keyFindings }}</pre>
            </div>
            <div v-if="line.problems" class="line-section">
              <strong>问题:</strong>
              <pre class="line-content">{{ line.problems }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateWeeklyReport, getWeeklyReport, getWeeklyReports } from '@/services/api';
import type { WeeklyReport } from '@/services/types';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const REPORT_STATUS: Record<string, string> = { DRAFT: '草稿', READY: '准备就绪', COMPLETED: '已完成' };

const reports = ref<WeeklyReport[]>([]);
const activeTab = ref<'reports' | 'schedule'>('reports');
const generating = ref(false);
const currentReport = ref<WeeklyReport | null>(null);

async function generateReport() {
  const user = JSON.parse(localStorage.getItem('rf_user') || 'null');
  const labId = user?.labId || '';
  if (!labId) return;
  generating.value = true;
  try {
    const now = dayjs();
    const report = await generateWeeklyReport({
      labId,
      weekStart: now.startOf('isoWeek').format('YYYY-MM-DD'),
      weekEnd: now.endOf('isoWeek').format('YYYY-MM-DD'),
    });
    reports.value.unshift(report);
  } finally {
    generating.value = false;
  }
}

async function viewReport(id: string) {
  currentReport.value = await getWeeklyReport(id);
}

async function exportMarkdown() {
  if (!currentReport.value) return;
  const md = await import('@/services/api').then(m => m.getWeeklyReportMarkdown(currentReport.value!.id));
  navigator.clipboard.writeText(md);
}

function getWeekNumber(date: string) {
  return dayjs(date).isoWeek();
}

function formatDate(d: string) {
  return dayjs(d).format('MM-DD');
}

function getReportStatusClass(status: string) {
  const map: Record<string, string> = { DRAFT: 'tag tag-warning', READY: 'tag tag-info', COMPLETED: 'tag tag-success' };
  return map[status] || 'tag';
}

onMounted(async () => {
  const labId = localStorage.getItem('rf_user') ? JSON.parse(localStorage.getItem('rf_user')!).labId : '';
  if (!labId) return;
  try {
    const result = await getWeeklyReports({ labId, page: 1, pageSize: 10 });
    reports.value = result.items;
  } catch {}
});
</script>

<style scoped>
.meeting-page { max-width: 960px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 600; }
.tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--color-bg-3); padding: 4px; border-radius: var(--radius-sm); width: fit-content; }
.tab { padding: 8px 16px; border-radius: var(--radius-sm); background: transparent; font-size: 14px; color: var(--color-text-2); }
.tab-active { background: var(--color-bg-1); color: var(--color-primary); font-weight: 500; box-shadow: var(--shadow-sm); }
.report-list { display: flex; flex-direction: column; gap: 10px; }
.report-card { cursor: pointer; padding: 16px; transition: box-shadow 0.2s; }
.report-card:hover { box-shadow: var(--shadow-md); }
.report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.report-header h3 { font-size: 15px; font-weight: 500; }
.report-date { font-size: 13px; color: var(--color-text-3); }
.report-summary { font-size: 13px; color: var(--color-text-3); margin-top: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { width: 700px; max-height: 80vh; overflow-y: auto; padding: 24px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { font-size: 18px; font-weight: 600; }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.report-lines { display: flex; flex-direction: column; gap: 16px; }
.report-line { padding: 12px; border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.report-line h4 { font-size: 15px; font-weight: 500; margin-bottom: 8px; }
.line-stats { display: flex; gap: 6px; margin-bottom: 8px; }
.line-section { margin-top: 8px; font-size: 14px; }
.line-content { font-size: 13px; color: var(--color-text-2); white-space: pre-wrap; background: var(--color-bg-3); padding: 8px; border-radius: var(--radius-sm); margin-top: 4px; }
</style>