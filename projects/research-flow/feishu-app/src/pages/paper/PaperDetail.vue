<template>
  <div class="paper-detail" v-if="paper">
    <div class="page-header">
      <router-link to="/papers" class="back-link">← 返回列表</router-link>
      <div class="header-content">
        <h2>{{ paper.title }}</h2>
        <span :class="getStatusClass(paper.status)">{{ STATUS_LABELS[paper.status] }}</span>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-main card">
        <div v-if="paper.abstract" class="section">
          <h3>摘要</h3>
          <p>{{ paper.abstract }}</p>
        </div>
        <div class="section">
          <h3>里程碑时间线</h3>
          <div class="timeline">
            <div
              v-for="ms in paper.milestones"
              :key="ms.id"
              class="timeline-item"
              :class="'ms-' + ms.status.toLowerCase()"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-label">{{ MS_LABELS[ms.stage] }}</div>
                <div class="timeline-date">
                  计划: {{ formatDate(ms.plannedDate) }}
                  <span v-if="ms.actualDate"> · 完成: {{ formatDate(ms.actualDate) }}</span>
                </div>
                <div v-if="ms.note" class="timeline-note">{{ ms.note }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-sidebar">
        <div class="card sidebar-card">
          <h4>信息</h4>
          <div class="info-row"><span class="label">作者</span><span>{{ paper.author?.name }}</span></div>
          <div class="info-row" v-if="paper.venue"><span class="label">期刊/会议</span><span>{{ paper.venue }}</span></div>
          <div class="info-row"><span class="label">进度</span>
            <div class="progress-bar-sm">
              <div class="progress-fill-sm" :style="{ width: getProgress(paper.status) + '%' }"></div>
            </div>
            {{ getProgress(paper.status) }}%
          </div>
        </div>

        <div class="card sidebar-card">
          <h4>添加里程碑</h4>
          <div class="form-group">
            <label class="form-label">阶段</label>
            <select v-model="newMs.stage" class="form-input-sm">
              <option v-for="(label, key) in MS_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">计划日期</label>
            <input v-model="newMs.plannedDate" type="date" class="form-input-sm" />
          </div>
          <button class="btn btn-primary btn-sm" @click="addMilestone">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPaper, updatePaper } from '@/services/api';
import { PAPER_STATUS_LABELS as STATUS_LABELS } from '@/services/types';
import type { Paper, PaperStatus, MilestoneStatus } from '@/services/types';
import dayjs from 'dayjs';

const MS_LABELS: Record<string, string> = STATUS_LABELS;
const route = useRoute();
const paper = ref<Paper | null>(null);

const newMs = ref<{ stage: PaperStatus; plannedDate: string }>({
  stage: 'PROPOSAL',
  plannedDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
});

async function fetchPaper() {
  paper.value = await getPaper(route.params.id as string);
}

async function addMilestone() {
  if (!paper.value) return;
  await updatePaper(paper.value.id, {
    status: paper.value.status,
  } as any);
  await fetchPaper();
}

function getStatusClass(status: PaperStatus) {
  const map: Record<string, string> = {
    IDEA: 'tag', PROPOSAL: 'tag tag-info', EXPERIMENT: 'tag tag-info',
    DATA_ANALYSIS: 'tag tag-info', WRITING: 'tag tag-warning',
    SUBMITTED: 'tag tag-warning', REVIEW: 'tag tag-warning',
    REVISION: 'tag tag-warning', ACCEPTED: 'tag tag-success',
    PUBLISHED: 'tag tag-success',
  };
  return map[status] || 'tag';
}

function getProgress(status: PaperStatus): number {
  const map: Record<PaperStatus, number> = {
    IDEA: 5, PROPOSAL: 15, EXPERIMENT: 30, DATA_ANALYSIS: 45,
    WRITING: 60, SUBMITTED: 70, REVIEW: 80, REVISION: 85,
    ACCEPTED: 95, PUBLISHED: 100,
  };
  return map[status] ?? 0;
}

function formatDate(d: string) {
  return dayjs(d).format('YYYY-MM-DD');
}

onMounted(fetchPaper);
</script>

<style scoped>
.paper-detail { max-width: 1100px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.back-link { font-size: 13px; color: var(--color-text-3); display: block; margin-bottom: 4px; }
.header-content { display: flex; align-items: center; gap: 10px; }
.header-content h2 { font-size: 20px; font-weight: 600; }
.detail-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
.detail-main { padding: 20px; }
.section { margin-bottom: 20px; }
.section h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; gap: 12px; padding: 10px 0; border-left: 2px solid var(--color-border-light); margin-left: 6px; padding-left: 16px; position: relative; }
.timeline-dot { position: absolute; left: -7px; top: 14px; width: 12px; height: 12px; border-radius: 50%; background: var(--color-text-4); }
.ms-completed .timeline-dot { background: var(--color-success); }
.ms-in_progress .timeline-dot { background: var(--color-primary); }
.ms-overdue .timeline-dot { background: var(--color-danger); }
.timeline-label { font-weight: 500; font-size: 14px; }
.timeline-date { font-size: 12px; color: var(--color-text-3); }
.timeline-note { font-size: 13px; color: var(--color-text-2); margin-top: 2px; }
.sidebar-card { margin-bottom: 12px; padding: 14px; }
.sidebar-card h4 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.label { color: var(--color-text-3); }
.progress-bar-sm { flex: 1; height: 4px; background: var(--color-bg-3); border-radius: 2px; overflow: hidden; margin: 0 8px; }
.progress-fill-sm { height: 100%; background: var(--color-primary); border-radius: 2px; }
.form-group { margin-bottom: 10px; }
.form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: var(--color-text-2); }
.form-input-sm { width: 100%; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; }
.btn-sm { padding: 6px 12px; font-size: 13px; }
@media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
</style>