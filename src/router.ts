import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
    {
      path: '/topology',
      name: 'topology',
      component: () => import('@/views/TopologyMapView.vue'),
    },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
