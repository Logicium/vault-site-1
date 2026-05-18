<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useAdminAuthStore } from '../platform/adminAuthStore'

const auth = useAdminAuthStore()
const route = useRoute()

onMounted(() => auth.refresh())

const navItems = [
  { to: '/admin', label: 'Sites', exact: true },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/inbox', label: 'Inbox' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/instagram', label: 'Instagram' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/domain', label: 'Domain' },
  { to: '/admin/billing', label: 'Billing' },
]

const requiresLogin = computed(() => !auth.owner && !auth.loading && route.name !== 'admin-login')
</script>

<template>
  <div class="admin-shell">
    <header class="admin-bar">
      <RouterLink to="/admin" class="brand">Apotome · Admin</RouterLink>
      <nav v-if="auth.owner" class="admin-nav">
        <RouterLink v-for="n in navItems" :key="n.to" :to="n.to" :exact-active-class="n.exact ? 'active' : ''" active-class="active">
          {{ n.label }}
        </RouterLink>
      </nav>
      <div class="admin-user">
        <template v-if="auth.owner">
          <span>{{ auth.owner.email }}</span>
          <button type="button" @click="auth.logout()">Log out</button>
        </template>
      </div>
    </header>

    <main class="admin-main">
      <div v-if="requiresLogin" class="admin-gate">
        <p>You need to sign in to access the admin.</p>
        <RouterLink to="/admin/login" class="btn">Sign in</RouterLink>
      </div>
      <RouterView v-else />
    </main>
  </div>
</template>

<style scoped>
.admin-shell { min-height: 100vh; display: flex; flex-direction: column; background: #0f0f10; color: #f5f5f5; }
.admin-bar { display: flex; align-items: center; gap: 1.5rem; padding: 0.75rem 1.25rem; border-bottom: 1px solid #2a2a2c; }
.brand { font-weight: 600; color: inherit; text-decoration: none; }
.admin-nav { display: flex; gap: 1rem; flex: 1; }
.admin-nav a { color: #c0c0c4; text-decoration: none; padding: 0.25rem 0.5rem; border-radius: 4px; }
.admin-nav a.active { background: #2a2a2c; color: #fff; }
.admin-user { display: flex; gap: 0.75rem; align-items: center; font-size: 0.9rem; }
.admin-user button { background: transparent; border: 1px solid #444; color: inherit; padding: 0.25rem 0.6rem; border-radius: 4px; cursor: pointer; }
.admin-main { flex: 1; padding: 1.5rem; max-width: 1200px; width: 100%; margin: 0 auto; }
.admin-gate { text-align: center; padding: 4rem 1rem; }
.btn { display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #f5f5f5; color: #0f0f10; border-radius: 4px; text-decoration: none; font-weight: 500; }
</style>
