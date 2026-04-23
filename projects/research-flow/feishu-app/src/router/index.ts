import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from '@/services/api';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { title: '登录', requiresAuth: false, layout: 'blank' },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/pages/auth/AuthCallback.vue'),
    meta: { title: '登录中', requiresAuth: false, layout: 'blank' },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
    meta: { title: '导师看板' },
  },
  {
    path: '/experiments',
    name: 'experiments',
    component: () => import('@/pages/experiment/ExperimentList.vue'),
    meta: { title: '实验记录' },
  },
  {
    path: '/experiments/new',
    name: 'experiment-new',
    component: () => import('@/pages/experiment/ExperimentForm.vue'),
    meta: { title: '新建实验' },
  },
  {
    path: '/experiments/:id',
    name: 'experiment-detail',
    component: () => import('@/pages/experiment/ExperimentDetail.vue'),
    meta: { title: '实验详情' },
  },
  {
    path: '/experiments/:id/edit',
    name: 'experiment-edit',
    component: () => import('@/pages/experiment/ExperimentForm.vue'),
    meta: { title: '编辑实验' },
  },
  {
    path: '/papers',
    name: 'papers',
    component: () => import('@/pages/paper/PaperList.vue'),
    meta: { title: '论文进度' },
  },
  {
    path: '/papers/:id',
    name: 'paper-detail',
    component: () => import('@/pages/paper/PaperDetail.vue'),
    meta: { title: '论文详情' },
  },
  {
    path: '/meetings',
    name: 'meetings',
    component: () => import('@/pages/meeting/MeetingPage.vue'),
    meta: { title: '组会管理' },
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('@/pages/lab-equipment/EquipmentList.vue'),
    meta: { title: '设备预约' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  document.title = `${to.meta.title || '研飞'} - ResearchFlow`;

  // Auth guard: redirect to login if not authenticated
  if (to.meta.requiresAuth !== false && !isLoggedIn()) {
    return { name: 'login' };
  }
});

export default router;