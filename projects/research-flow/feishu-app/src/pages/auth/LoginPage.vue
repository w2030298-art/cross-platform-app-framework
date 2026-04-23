<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">研飞</div>
      <div class="login-subtitle">ResearchFlow · 科研团队一站式协作平台</div>

      <div v-if="loading" class="login-loading">
        <div class="spinner"></div>
        <p>正在登录...</p>
      </div>

      <div v-else-if="error" class="login-error">
        <p>{{ error }}</p>
        <button class="btn btn-secondary" @click="retry">重试</button>
      </div>

      <button v-else class="btn btn-primary login-btn" @click="loginWithFeishu">
        <span class="feishu-icon">💬</span>
        使用飞书账号登录
      </button>

      <div class="login-dev" v-if="isDev">
        <div class="divider">开发模式</div>
        <div class="dev-form">
          <select v-model="devRole" class="form-input">
            <option value="ADVISOR">导师</option>
            <option value="POSTDOC">博后</option>
            <option value="PHD">博士生</option>
            <option value="MASTER">硕士生</option>
          </select>
          <button class="btn btn-secondary dev-btn" @click="devLogin">快速登录 (Mock)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithFeishu as feishuLogin, getFeishuAuthUrl, setAuth } from '@/services/api';
import { useUserStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const error = ref('');
const isDev = ref(import.meta.env.DEV);
const devRole = ref('PHD');

async function loginWithFeishu() {
  try {
    loading.value = true;
    const url = await getFeishuAuthUrl();
    window.location.href = url;
  } catch (e: any) {
    error.value = e.message || '获取授权链接失败';
    loading.value = false;
  }
}

async function handleCallback() {
  const code = route.query.code as string;
  if (!code) return;

  loading.value = true;
  try {
    const result = await feishuLogin(code);
    userStore.setUser(result.user);
    router.push('/');
  } catch (e: any) {
    error.value = e.message || '登录失败';
  } finally {
    loading.value = false;
  }
}

function devLogin() {
  const mockUser = {
    id: 'dev-user-1',
    feishuOpenId: 'dev-open-id-1',
    name: devRole.value === 'ADVISOR' ? '导师测试' : '学生测试',
    role: devRole.value,
    labId: 'dev-lab-1',
  };

  // Generate a simple mock token for dev
  const mockToken = 'dev-mock-token-' + Date.now();
  setAuth(mockToken, mockUser);
  userStore.setUser(mockUser);
  router.push('/');
}

function retry() {
  error.value = '';
  loading.value = false;
}

onMounted(() => {
  if (route.query.code) {
    handleCallback();
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8edf5 100%);
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.login-logo {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-3);
  margin-bottom: 32px;
}

.login-btn {
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.feishu-icon {
  font-size: 20px;
}

.login-loading,
.login-error {
  padding: 20px 0;
}

.login-error {
  color: var(--color-danger);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-dev {
  margin-top: 24px;
}

.divider {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-4);
  margin-bottom: 12px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: var(--color-border);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.dev-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.dev-btn {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
}
</style>