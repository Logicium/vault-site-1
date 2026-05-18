/**
 * Pinia store for the owner-session.
 *
 * The session is a cookie set by the backend, so all we cache here is
 * "who am I right now?" — checked on demand.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contentClient } from './contentClient'

export interface AdminOwner { id: string; email: string; name?: string }

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const owner = ref<AdminOwner | null>(null)
  const loading = ref(false)

  async function refresh() {
    loading.value = true
    try {
      const res = await contentClient.me()
      owner.value = res.owner
    } catch {
      owner.value = null
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await contentClient.logout() } finally { owner.value = null }
  }

  return { owner, loading, refresh, logout }
})
