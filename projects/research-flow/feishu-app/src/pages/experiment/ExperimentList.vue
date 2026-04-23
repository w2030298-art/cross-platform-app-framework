<template>
  <div class="experiment-list">
    <div class="page-header">
      <h2>实验记录</h2>
      <router-link to="/experiments/new" class="btn btn-primary">+ 新建实验</router-link>
    </div>

    <div class="filters card">
      <div class="filter-row">
        <select v-model="filters.status" @change="fetchExperiments" class="filter-select">
          <option value="">全部状态</option>
          <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="filters.type" @change="fetchExperiments" class="filter-select">
          <option value="">全部类型</option>
          <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
        <input
          v-model="filters.keyword"
          @keyup.enter="fetchExperiments"
          placeholder="搜索实验..."
          class="filter-input"
        />
        <button class="btn btn-secondary" @click="fetchExperiments">搜索</button>
      </div>
    </div>

    <div v-if="loading" class="empty-state">
      <div class="empty-state-icon">⏳</div>
      <div class="empty-state-text">加载中...</div>
    </div>

    <div v-else-if="experiments.length" class="experiment-cards">
      <div
        v-for="exp in experiments"
        :key="exp.id"
        class="experiment-card card"
        @click="$router.push(`/experiments/${exp.id}`)"
      >
        <div class="card-header">
          <h3 class="card-title">{{ exp.title }}</h3>
          <span :class="getStatusClass(exp.status)">{{ STATUS_LABELS[exp.status] }}</span>
        </div>
        <div class="card-meta">
          <span>{{ TYPE_LABELS[exp.type] }}</span>
          <span>·</span>
          <span>{{ exp.author?.name }}</span>
          <span>·</span>
          <span>{{ formatDate(exp.date) }}</span>
        </div>
        <div class="card-tags" v-if="formatTags(exp.tags).length">
          <span v-for="tag in formatTags(exp.tags).slice(0, 3)" :key="tag" class="tag tag-info">{{ tag }}</span>
        </div>
        <div v-if="exp.conclusion" class="card-conclusion">{{ truncate(exp.conclusion, 80) }}</div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">🧪</div>
      <div class="empty-state-text">暂无实验记录，点击右上角新建</div>
    </div>

    <div v-if="total > pageSize" class="pagination">
      <button class="btn btn-secondary" :disabled="page <= 1" @click="page--; fetchExperiments()">上一页</button>
      <span class="page-info">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
      <button class="btn btn-secondary" :disabled="page >= Math.ceil(total / pageSize)" @click="page++; fetchExperiments()">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getExperiments } from '@/services/api';
import { EXPERIMENT_TYPE_LABELS as TYPE_LABELS, EXPERIMENT_STATUS_LABELS as STATUS_LABELS, formatTags } from '@/services/types';
import type { Experiment, ExperimentStatus, ExperimentType } from '@/services/types';
import dayjs from 'dayjs';

const experiments = ref<Experiment[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);

const filters = ref<{
  status: ExperimentStatus | '';
  type: ExperimentType | '';
  keyword: string;
}>({
  status: '',
  type: '',
  keyword: '',
});

async function fetchExperiments() {
  loading.value = true;
  try {
    const result = await getExperiments({
      page: page.value,
      pageSize,
      status: filters.value.status || undefined,
      type: filters.value.type || undefined,
      keyword: filters.value.keyword || undefined,
    } as any);
    experiments.value = result.items;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function getStatusClass(status: ExperimentStatus) {
  const map: Record<string, string> = {
    COMPLETED: 'tag tag-success',
    IN_PROGRESS: 'tag tag-info',
    FAILED: 'tag tag-danger',
    PAUSED: 'tag tag-warning',
  };
  return map[status] || 'tag';
}

function formatDate(d: string) {
  return dayjs(d).format('MM-DD');
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

onMounted(fetchExperiments);
</script>

<style scoped>
.experiment-list {
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

.filters {
  margin-bottom: 16px;
  padding: 12px 16px;
}

.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--color-bg-1);
}

.filter-input {
  flex: 1;
  min-width: 200px;
}

.experiment-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.experiment-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.experiment-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
}

.card-meta {
  font-size: 13px;
  color: var(--color-text-3);
  display: flex;
  gap: 6px;
}

.card-tags {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.card-conclusion {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-2);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: var(--color-text-3);
}
</style>