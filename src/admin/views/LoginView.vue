<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { contentClient } from '../../platform/contentClient'
import { useAdminAuthStore } from '../../platform/adminAuthStore'

type Mode = 'login' | 'register' | 'magic'
const mode = ref<Mode>('login')
const email = ref('')
const password = ref('')
const name = ref('')
const sent = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)

const auth = useAdminAuthStore()
const router = useRouter()

async function submit() {
  error.value = null
  busy.value = true
  try {
    if (mode.value === 'magic') {
      await contentClient.requestMagicLink(email.value.trim())
      sent.value = true
    } else if (mode.value === 'login') {
      await contentClient.passwordLogin(email.value.trim(), password.value)
      await auth.refresh()
      router.replace('/admin')
    } else {
      await contentClient.passwordRegister(email.value.trim(), password.value, name.value || undefined)
      await auth.refresh()
      router.replace('/admin')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="login">
    <h1>Sign in</h1>

    <nav class="tabs">
      <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">Password</button>
      <button type="button" :class="{ active: mode === 'register' }" @click="mode = 'register'">Create account</button>
      <button type="button" :class="{ active: mode === 'magic' }" @click="mode = 'magic'">Email link</button>
    </nav>

    <form v-if="mode !== 'magic' || !sent" @submit.prevent="submit">
      <input v-model="email" type="email" required placeholder="you@example.com" autocomplete="email" />
      <input
        v-if="mode === 'register'"
        v-model="name"
        type="text"
        placeholder="Your name (optional)"
        autocomplete="name"
      />
      <input
        v-if="mode !== 'magic'"
        v-model="password"
        type="password"
        required
        minlength="8"
        placeholder="Password (min 8 chars)"
        :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
      />
      <button type="submit" :disabled="busy">
        {{ busy ? 'Working…' : mode === 'magic' ? 'Email me a link' : mode === 'register' ? 'Create account' : 'Sign in' }}
      </button>
      <p v-if="error" class="err">{{ error }}</p>
    </form>
    <p v-else class="ok">Check <strong>{{ email }}</strong> for your sign-in link.</p>
  </section>
</template>

<style scoped>
.login { max-width: 420px; margin: 4rem auto; }
.tabs { display: flex; gap: 0; margin: 1rem 0; border-bottom: 1px solid #2a2a2c; }
.tabs button { flex: 1; padding: 0.5rem; background: transparent; border: 0; border-bottom: 2px solid transparent; color: #aaa; cursor: pointer; font: inherit; }
.tabs button.active { color: #fff; border-bottom-color: #f5f5f5; }
form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
input, button { padding: 0.6rem 0.8rem; font: inherit; border-radius: 4px; border: 1px solid #444; background: #1a1a1c; color: inherit; }
form > button { background: #f5f5f5; color: #0f0f10; cursor: pointer; font-weight: 600; }
.err { color: #ff8080; }
.ok { color: #80ff80; margin-top: 1rem; }
</style>
