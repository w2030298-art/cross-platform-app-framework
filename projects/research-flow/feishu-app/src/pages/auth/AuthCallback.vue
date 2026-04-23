<template>
  <div class="callback-page">
    <div class="spinner"></div>
    <p>正在登录...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithFeishu } from '@/services/api';
import { useUserStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

onMounted(async () => {
  const code = route.query.code as string;
  if (!code) {
    router.replace('/login');
    return;
  }

  try {
    const result = await loginWithFeishu(code);
    userStore.setUser(result.user);
    router.replace('/');
  } catch (e: any) {
    console.error('Login failed:', e);
    router.replace('/login');
  }
});
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>