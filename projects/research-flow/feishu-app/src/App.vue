<template>
  <div class="app-layout">
    <!-- Auth pages: no sidebar -->
    <template v-if="isBlankLayout">
      <router-view />
    </template>

    <!-- App pages: with sidebar -->
    <template v-else>
      <nav class="sidebar">
        <div class="sidebar-header">
          <h1 class="app-logo">研飞</h1>
          <span class="app-subtitle">ResearchFlow</span>
        </div>
        <ul class="nav-list">
          <li>
            <router-link to="/" class="nav-item" active-class="active">
              <span class="nav-icon">📊</span>
              <span class="nav-text">导师看板</span>
            </router-link>
          </li>
          <li>
            <router-link to="/experiments" class="nav-item" active-class="active">
              <span class="nav-icon">🧪</span>
              <span class="nav-text">实验记录</span>
            </router-link>
          </li>
          <li>
            <router-link to="/papers" class="nav-item" active-class="active">
              <span class="nav-icon">📄</span>
              <span class="nav-text">论文进度</span>
            </router-link>
          </li>
          <li>
            <router-link to="/meetings" class="nav-item" active-class="active">
              <span class="nav-icon">📅</span>
              <span class="nav-text">组会管理</span>
            </router-link>
          </li>
          <li>
            <router-link to="/equipment" class="nav-item" active-class="active">
              <span class="nav-icon">🔧</span>
              <span class="nav-text">设备预约</span>
            </router-link>
          </li>
        </ul>
        <div class="sidebar-footer">
          <div class="user-info" v-if="userStore.user">
            <div class="user-avatar">{{ userStore.user.name?.[0] || '?' }}</div>
            <div class="user-details">
              <div class="user-name">{{ userStore.user.name }}</div>
              <div class="user-role">{{ getRoleLabel(userStore.user.role) }}</div>
            </div>
          </div>
          <button class="logout-btn" @click="handleLogout" title="退出登录">退出</button>
        </div>
      </nav>
      <main class="main-content">
        <router-view />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores';
import { getAuthUser, clearAuth } from '@/services/api';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const ROLE_LABELS: Record<string, string> = {
  ADVISOR: '导师',
  POSTDOC: '博后',
  PHD: '博士生',
  MASTER: '硕士生',
  ADMIN: '管理员',
};

const isBlankLayout = computed(() => {
  return route.meta.layout === 'blank';
});

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

function handleLogout() {
  clearAuth();
  userStore.clear();
  router.push('/login');
}

onMounted(() => {
  const user = getAuthUser();
  if (user) {
    userStore.setUser(user);
  }
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--color-bg-1);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 10;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.app-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.app-subtitle {
  font-size: 12px;
  color: var(--color-text-3);
}

.nav-list {
  list-style: none;
  padding: 8px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: var(--color-text-2);
  text-decoration: none;
  transition: all 0.2s;
  margin: 2px 8px;
  border-radius: var(--radius-sm);
}

.nav-item:hover {
  background: var(--color-bg-3);
  color: var(--color-text-1);
}

.nav-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  margin-right: 10px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: var(--color-text-3);
}

.logout-btn {
  background: none;
  border: none;
  color: var(--color-text-3);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
}

.logout-btn:hover {
  color: var(--color-danger);
}

.main-content {
  flex: 1;
  margin-left: 220px;
  padding: 24px;
  min-height: 100vh;
}
</style>