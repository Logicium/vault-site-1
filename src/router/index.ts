import { createRouter, createWebHistory } from 'vue-router'
import { siteConfig } from '../config/site.config'
import { PLATFORM_ENABLED } from '../platform/config'
import { adminRoutes } from '../admin/routes'

const isPortfolio = siteConfig.variant === 'portfolio'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/shop', name: 'shop', component: () => import('../views/ShopView.vue') },
    { path: '/visit', name: 'visit', component: () => import('../views/VisitView.vue') },
    ...(isPortfolio
      ? [{ path: '/gallery', name: 'gallery', component: () => import('../views/GalleryView.vue') }]
      : []),
    ...(PLATFORM_ENABLED ? adminRoutes : []),
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
