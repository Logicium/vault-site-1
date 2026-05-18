<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuthStore } from '../../platform/adminAuthStore'
import { PLATFORM_API } from '../../platform/config'

const route = useRoute()
const router = useRouter()
const auth = useAdminAuthStore()
const state = ref<'verifying' | 'ok' | 'fail'>('verifying')
const message = ref('')

onMounted(async () => {
  const token = String(route.query.token || '')
  if (!token) { state.value = 'fail'; message.value = 'Missing token'; return }
  try {
    const res = await fetch(`${PLATFORM_API}/auth/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET', credentials: 'include',
    })
    if (!res.ok) throw new Error(`Status ${res.status}`)
    await auth.refresh()
    state.value = 'ok'
    setTimeout(() => router.replace('/admin'), 500)
  } catch (e) {
    state.value = 'fail'
    message.value = e instanceof Error ? e.message : String(e)
  }
})
</script>

<template>
  <section class="verify">
    <p v-if="state === 'verifying'">Verifying…</p>
    <p v-else-if="state === 'ok'">Signed in. Redirecting…</p>
    <p v-else class="err">Sign-in failed: {{ message }}</p>
  </section>
</template>

<style scoped>
.verify { text-align: center; padding: 4rem 1rem; }
.err { color: #ff8080; }
</style>
