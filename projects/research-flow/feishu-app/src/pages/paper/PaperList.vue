<template>
  <div class="paper-list">
    <div class="page-header">
      <h2>论文进度</h2>
      <button class="btn btn-primary" @click="showCreate = true">+ 新增论文</button>
    </div>

    <div class="paper-grid" v-if="papers.length">
      <div v-for="paper in papers" :key="paper.id" class="paper-card card" @click="$router.push(`/papers/${paper.id}`)">
        <div class="paper-header">
          <h3 class="paper-title">{{ paper.title }}</h3>
          <span :class="getStatusClass(paper.status)">{{ STATUS_LABELS[paper.status] }}</span>
        </div>
        <div class="paper-meta">
          {{ paper.author?.name }}
          <span v-if="paper.venue"> · {{ paper.venue }}</span>
        </div>
        <div class="paper-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: getProgress(paper.status) + '%' }"></div>
          </div>
          <span class="progress-text">{{ getProgress(paper.status) }}%</span>
        </div>
        <div v-if="paper.milestones?.length" class="milestones">
          <div v-for="m in paper.milestones.slice(-3)" :key="m.id" class="milestone-item" :class="'ms-' + m.status.toLowerCase()">
            <span class="ms-dot"></span>
            {{ MS_LABELS[m.stage] }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">📄</div>
      <div class="empty-state-text">暂无论文，点击右上角新增</div>
    </div>

    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal card">
        <h3>新增论文</h3>
        <div class="form-group">
          <label class="form-label">论文标题 *</label>
          <input v-model="newPaper.title" class="form-input" placeholder="论文标题" />
        </div>
        <div class="form-group">
          <label class="form-label">投稿期刊/会议</label>
          <input v-model="newPaper.venue" class="form-input" placeholder="如：NeurIPS 2026" />
        </div>
        <div class="form-group">
          <label class="form-label">当前阶段</label>
          <select v-model="newPaper.status" class="form-input">
            <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="showCreate = false">取消</button>
          <button class="btn btn-primary" @click="handleCreate" :disabled="!newPaper.title">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getPapers, createPaper } from '@/services/api';
import { PAPER_STATUS_LABELS as STATUS_LABELS, formatTags } from '@/services/types';
import type { Paper, PaperStatus } from '@/services/types';

const papers = ref<Paper[]>([]);
const showCreate = ref(false);
const newPaper = ref<{ title: string; venue: string; status: PaperStatus }>({
  title: '',
  venue: '',
  status: 'IDEA',
});

const MS_LABELS: Record<string, string> = STATUS_LABELS;

async function fetchPapers() {
  const stored = localStorage.getItem('rf_user');
  const labId = stored ? JSON.parse(stored).labId : '';
  papers.value = await getPapers({ labId });
}

async function handleCreate() {
  if (!newPaper.value.title) return;
  await createPaper(newPaper.value);
  showCreate.value = false;
  newPaper.value = { title: '', venue: '', status: 'IDEA' };
  await fetchPapers();
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

onMounted(fetchPapers);
</script>

<style scoped>
.paper-list {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
}

.paper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.paper-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
  padding: 16px;
}

.paper-card:hover {
  box-shadow: var(--shadow-md);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.paper-title {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
  margin-right: 8px;
}

.paper-meta {
  font-size: 13px;
  color: var(--color-text-3);
  margin-bottom: 10px;
}

.paper-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
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

.milestones {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.milestone-item {
  font-size: 12px;
  color: var(--color-text-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.ms-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-4);
}

.ms-completed .ms-dot { background: var(--color-success); }
.ms-in_progress .ms-dot { background: var(--color-primary); }
.ms-overdue .ms-dot { background: var(--color-danger); }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--color-text-2);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}
</style>