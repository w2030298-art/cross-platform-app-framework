import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthUser, User } from '@/services/types';
import { getAuthUser, isLoggedIn as checkLoggedIn } from '@/services/api';

export const useUserStore = defineStore('user', () => {
  const user = ref<AuthUser | null>(null);
  const labId = ref<string>('');

  const isLoggedIn = computed(() => !!user.value);

  function setUser(u: AuthUser | any) {
    user.value = u;
    labId.value = u.labId ?? '';
  }

  function loadFromStorage() {
    const stored = getAuthUser();
    if (stored) {
      user.value = stored;
      labId.value = stored.labId ?? '';
    }
  }

  function clear() {
    user.value = null;
    labId.value = '';
  }

  return { user, labId, isLoggedIn, setUser, loadFromStorage, clear };
});

export const useDashboardStore = defineStore('dashboard', () => {
  const overview = ref<any>(null);
  const loading = ref(false);

  async function fetchOverview(labId?: string) {
    const { getDashboardOverview } = await import('@/services/api');
    loading.value = true;
    try {
      overview.value = await getDashboardOverview(labId);
    } finally {
      loading.value = false;
    }
  }

  return { overview, loading, fetchOverview };
});