<template>
  <div class="experiment-form">
    <div class="page-header">
      <router-link to="/experiments" class="back-link">← 返回列表</router-link>
      <h2>{{ isEdit ? '编辑实验' : '新建实验' }}</h2>
    </div>

    <form class="form-card card" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">实验标题 *</label>
        <input v-model="form.title" class="form-input" placeholder="如：DQN调参实验-lr=0.001" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">实验类型 *</label>
          <select v-model="form.type" class="form-input" required>
            <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-group" v-if="isEdit">
          <label class="form-label">状态</label>
          <select v-model="form.status" class="form-input">
            <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">实验目的 / 假设</label>
        <textarea v-model="form.purpose" class="form-textarea" placeholder="本次实验要验证什么假设？" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">实验过程</label>
        <textarea v-model="form.process" class="form-textarea" placeholder="记录实验过程..." rows="6"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">实验结果</label>
          <textarea v-model="form.result" class="form-textarea" placeholder="结果摘要" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">结论</label>
          <textarea v-model="form.conclusion" class="form-textarea" placeholder="实验结论" rows="3"></textarea>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">下一步</label>
        <input v-model="form.nextStep" class="form-input" placeholder="基于本次实验的下一步计划" />
      </div>

      <div class="form-group">
        <label class="form-label">标签 (逗号分隔)</label>
        <input v-model="tagsInput" class="form-input" placeholder="baseline, ablation, RL" />
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$router.back()">取消</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createExperiment, updateExperiment, getExperiment } from '@/services/api';
import { EXPERIMENT_TYPE_LABELS as TYPE_LABELS, EXPERIMENT_STATUS_LABELS as STATUS_LABELS, formatTags } from '@/services/types';
import type { ExperimentType, ExperimentStatus } from '@/services/types';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const submitting = ref(false);
const tagsInput = ref('');

const form = ref<{
  title: string;
  type: ExperimentType;
  status: ExperimentStatus;
  purpose: string;
  process: string;
  result: string;
  conclusion: string;
  nextStep: string;
}>({
  title: '',
  type: 'ALGORITHM_VERIFICATION',
  status: 'IN_PROGRESS',
  purpose: '',
  process: '',
  result: '',
  conclusion: '',
  nextStep: '',
});

async function loadExperiment() {
  if (!isEdit.value) return;
  const exp = await getExperiment(route.params.id as string);
  form.value = {
    title: exp.title,
    type: exp.type,
    status: exp.status,
    purpose: exp.purpose || '',
    process: exp.process || '',
    result: exp.result || '',
    conclusion: exp.conclusion || '',
    nextStep: exp.nextStep || '',
  };
  tagsInput.value = formatTags(exp.tags).join(', ');
}

async function handleSubmit() {
  submitting.value = true;
  try {
    const tags = tagsInput.value ? JSON.stringify(tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)) : '[]';
    const payload = {
      ...form.value,
      tags,
    };

    if (isEdit.value) {
      await updateExperiment(route.params.id as string, payload);
    } else {
      await createExperiment(payload);
    }
    router.push('/experiments');
  } finally {
    submitting.value = false;
  }
}

onMounted(loadExperiment);
</script>

<style scoped>
.experiment-form {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.back-link {
  font-size: 13px;
  color: var(--color-text-3);
  display: block;
  margin-bottom: 4px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
}

.form-card {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--color-text-2);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--color-bg-1);
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}
</style>