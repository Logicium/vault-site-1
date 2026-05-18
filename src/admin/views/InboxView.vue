<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const siteId = ref('')
const items = ref<Awaited<ReturnType<typeof contentClient.listSubmissions>>>([])
const error = ref<string | null>(null)

async function load() {
  if (!siteId.value) return
  try { items.value = await contentClient.listSubmissions(siteId.value) }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function markRead(id: string) {
  await contentClient.markSubmissionRead(siteId.value, id)
  await load()
}

onMounted(async () => {
  sites.value = await contentClient.listSites()
  if (sites.value[0]) siteId.value = sites.value[0].id
})
watch(siteId, load)
</script>

<template>
  <section>
    <h1>Inbox</h1>
    <label>Site:
      <select v-model="siteId">
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.slug }}</option>
      </select>
    </label>
    <p v-if="error" class="err">{{ error }}</p>
    <ul class="inbox">
      <li v-for="m in items" :key="m.id" :class="{ unread: !m.readAt }">
        <header>
          <strong>{{ m.type }}</strong>
          <span>{{ new Date(m.createdAt).toLocaleString() }}</span>
          <button v-if="!m.readAt" type="button" @click="markRead(m.id)">Mark read</button>
        </header>
        <dl>
          <template v-for="(v, k) in m.payload" :key="k">
            <dt>{{ k }}</dt><dd>{{ v }}</dd>
          </template>
        </dl>
      </li>
      <li v-if="!items.length">No submissions.</li>
    </ul>
  </section>
</template>

<style scoped>
label { display: block; margin: 1rem 0; }
select { margin-left: 0.5rem; padding: 0.3rem 0.5rem; background: #1a1a1c; color: inherit; border: 1px solid #444; border-radius: 4px; }
.inbox { list-style: none; padding: 0; }
.inbox li { padding: 0.75rem; border: 1px solid #2a2a2c; border-radius: 6px; margin-bottom: 0.5rem; }
.inbox li.unread { border-color: #80c0ff; }
.inbox header { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; }
.inbox header span { color: #888; font-size: 0.85rem; flex: 1; }
.inbox button { padding: 0.2rem 0.5rem; background: transparent; border: 1px solid #444; color: inherit; border-radius: 4px; cursor: pointer; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1rem; margin: 0; }
dt { color: #888; }
.err { color: #ff8080; }
</style>
