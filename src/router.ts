import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/quick-match',
      name: 'quick-match',
      component: () => import('@/views/QuickMatchView.vue'),
    },
    {
      path: '/multiplayer',
      name: 'multiplayer',
      component: () => import('@/views/MultiplayerView.vue'),
    },
    { path: '/codex', name: 'codex', component: () => import('@/views/CodexView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
