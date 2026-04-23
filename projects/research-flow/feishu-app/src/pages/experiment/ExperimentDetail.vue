<template>
  <div class="experiment-detail" v-if="experiment">
    <div class="page-header">
      <div class="header-left">
        <router-link to="/experiments" class="back-link">← 返回列表</router-link>
        <h2>{{ experiment.title }}</h2>
      </div>
      <div class="header-actions">
        <span :class="getStatusClass(experiment.status)">{{ STATUS_LABELS[experiment.status] }}</span>
        <router-link :to="`/experiments/${experiment.id}/edit`" class="btn btn-secondary">编辑</router-link>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-main card">
        <div class="detail-section" v-if="experiment.purpose">
          <h3>实验目的</h3>
          <p>{{ experiment.purpose }}</p>
        </div>
        <div class="detail-section" v-if="experiment.process">
          <h3>实验过程</h3>
          <div class="rich-content" v-html="experiment.process"></div>
        </div>
        <div class="detail-section" v-if="experiment.result">
          <h3>实验结果</h3>
          <p>{{ experiment.result }}</p>
        </div>
        <div class="detail-section" v-if="experiment.conclusion">
          <h3>结论与下一步</h3>
          <p>{{ experiment.conclusion }}</p>
          <p v-if="experiment.nextStep" class="next-step">下一步: {{ experiment.nextStep }}</p>
        </div>
      </div>

      <div class="detail-sidebar">
        <div class="card sidebar-card">
          <h4>基本信息</h4>
          <div class="info-row">
            <span class="info-label">类型</span>
            <span>{{ TYPE_LABELS[experiment.type] }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">日期</span>
            <span>{{ formatDate(experiment.date) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">作者</span>
            <span>{{ experiment.author?.name }}</span>
          </div>
          <div class="info-row" v-if="formatTags(experiment.tags).length">
            <span class="info-label">标签</span>
            <div class="tags-wrap">
              <span v-for="tag in formatTags(experiment.tags)" :key="tag" class="tag tag-info">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="card sidebar-card">
          <h4>批注 ({{ experiment.comments?.length || 0 }})</h4>
          <div v-if="!experiment.comments?.length" class="no-comments">暂无批注</div>
          <div v-for="comment in experiment.comments" :key="comment.id" class="comment-item" :class="{ resolved: comment.resolved }">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author?.name }}</span>
              <span :class="getPriorityClass(comment.priority)">{{ getPriorityLabel(comment.priority) }}</span>
            </div>
            <div v-if="comment.quote" class="comment-quote">"{{ comment.quote }}"</div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-footer">
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              <button v-if="!comment.resolved" class="btn-resolve" @click="resolveComment(comment.id)">标记已解决</button>
              <span v-else class="resolved-badge">已解决 ✓</span>
            </div>
          </div>

          <div class="add-comment">
            <textarea v-model="newComment" placeholder="添加批注..." class="comment-input"></textarea>
            <button class="btn btn-primary" @click="addComment" :disabled="!newComment.trim()">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getExperiment, createComment, resolveComment as resolveCommentApi } from '@/services/api';
import { EXPERIMENT_TYPE_LABELS as TYPE_LABELS, EXPERIMENT_STATUS_LABELS as STATUS_LABELS, formatTags } from '@/services/types';
import type { Experiment, CommentPriority } from '@/services/types';
import dayjs from 'dayjs';

const route = useRoute();
const experiment = ref<Experiment | null>(null);
const newComment = ref('');

async function fetchExperiment() {
  experiment.value = await getExperiment(route.params.id as string);
}

async function addComment() {
  if (!newComment.value.trim() || !experiment.value) return;
  await createComment(experiment.value.id, { content: newComment.value.trim() });
  newComment.value = '';
  await fetchExperiment();
}

async function resolveComment(commentId: string) {
  await resolveCommentApi(commentId);
  await fetchExperiment();
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    COMPLETED: 'tag tag-success',
    IN_PROGRESS: 'tag tag-info',
    FAILED: 'tag tag-danger',
    PAUSED: 'tag tag-warning',
  };
  return map[status] || 'tag';
}

function getPriorityClass(priority: CommentPriority) {
  const map: Record<string, string> = {
    NORMAL: 'tag',
    IMPORTANT: 'tag tag-warning',
    URGENT: 'tag tag-danger',
  };
  return map[priority] || 'tag';
}

function getPriorityLabel(priority: CommentPriority) {
  const map: Record<string, string> = { NORMAL: '普通', IMPORTANT: '重要', URGENT: '紧急' };
  return map[priority] || priority;
}

function formatDate(d: string) {
  return dayjs(d).format('YYYY-MM-DD HH:mm');
}

onMounted(fetchExperiment);
</script>

<style scoped>
.experiment-detail {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.back-link {
  font-size: 13px;
  color: var(--color-text-3);
  display: block;
  margin-bottom: 4px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}

.detail-main {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-1);
}

.detail-section p {
  font-size: 14px;
  color: var(--color-text-2);
  line-height: 1.7;
}

.next-step {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-primary);
}

.sidebar-card {
  margin-bottom: 12px;
}

.sidebar-card h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.info-label {
  color: var(--color-text-3);
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.comment-item.resolved {
  opacity: 0.6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 500;
  font-size: 13px;
}

.comment-quote {
  font-size: 12px;
  color: var(--color-text-3);
  background: var(--color-bg-3);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
  border-left: 3px solid var(--color-primary);
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.comment-date {
  font-size: 12px;
  color: var(--color-text-4);
}

.btn-resolve {
  font-size: 12px;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
}

.resolved-badge {
  font-size: 12px;
  color: var(--color-success);
}

.no-comments {
  color: var(--color-text-3);
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}

.add-comment {
  margin-top: 12px;
}

.comment-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>