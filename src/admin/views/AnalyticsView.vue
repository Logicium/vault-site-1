<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const siteId = ref('')
const rows = ref<Awaited<ReturnType<typeof contentClient.getAnalytics>>>([])
const error = ref<string | null>(null)

async function load() {
  if (!siteId.value) return
  try { rows.value = await contentClient.getAnalytics(siteId.value) }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(async () => {
  sites.value = await contentClient.listSites()
  if (sites.value[0]) siteId.value = sites.value[0].id
})
watch(siteId, load)
</script>

<template>
  <section>
    <h1>Analytics</h1>
    <label>Site:
      <select v-model="siteId">
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.slug }}</option>
      </select>
    </label>
    <table>
      <thead><tr><th>Date</th><th>Visitors</th><th>Pageviews</th><th>Uptime (ms)</th><th>Error</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.date">
          <td>{{ r.date }}</td><td>{{ r.visitors }}</td><td>{{ r.pageviews }}</td><td>{{ r.uptimeLatencyMs }}</td><td>{{ r.uptimeError || '' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="error" class="err">{{ error }}</p>
  </section>
</template>

<style scoped>
label { display: block; margin: 1rem 0; }
select { padding: 0.4rem 0.6rem; background: #1a1a1c; color: inherit; border: 1px solid #444; border-radius: 4px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid #2a2a2c; text-align: left; }
.err { color: #ff8080; }
</style>
