<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try { sites.value = await contentClient.listSites() }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
  finally { loading.value = false }
})
</script>

<template>
  <section>
    <h1>Your sites</h1>
    <p v-if="loading">Loading…</p>
    <p v-if="error" class="err">{{ error }}</p>
    <table v-if="sites.length">
      <thead>
        <tr><th>Slug</th><th>Archetype</th><th>Status</th><th>URL</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in sites" :key="s.id">
          <td>{{ s.slug }}</td>
          <td>{{ s.archetype }}</td>
          <td>{{ s.status }}</td>
          <td>
            <a v-if="s.customDomain" :href="`https://${s.customDomain}`" target="_blank" rel="noopener">{{ s.customDomain }}</a>
            <a v-else-if="s.productionUrl" :href="s.productionUrl" target="_blank" rel="noopener">{{ s.productionUrl }}</a>
            <span v-else>—</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!loading && !error">No sites yet.</p>
  </section>
</template>

<style scoped>
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #2a2a2c; text-align: left; }
.err { color: #ff8080; }
a { color: #80c0ff; }
</style>
