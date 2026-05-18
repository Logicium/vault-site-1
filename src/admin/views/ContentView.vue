<script setup lang="ts">
/**
 * Schema-less JSON editor for the site's content payload.
 * The owner picks a site, we load the draft, they edit, save or publish.
 * A future iteration will replace this with form fields generated from
 * the MesaSiteConfig type.
 */
import { onMounted, ref, watch } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const siteId = ref<string>('')
const draftJson = ref('')
const version = ref(0)
const published = ref(false)
const status = ref<string>('')
const error = ref<string | null>(null)

async function loadDraft() {
  if (!siteId.value) return
  error.value = null
  try {
    const d = await contentClient.getDraft(siteId.value)
    draftJson.value = JSON.stringify(d.payload, null, 2)
    version.value = d.version
    published.value = d.published
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}

async function save(publish = false) {
  error.value = null
  status.value = ''
  try {
    const payload = JSON.parse(draftJson.value)
    if (publish) {
      const r = await contentClient.publish(siteId.value, payload)
      status.value = `Published v${r.version}`
      published.value = true
    } else {
      const r = await contentClient.saveDraft(siteId.value, payload)
      version.value = r.version
      status.value = 'Draft saved'
    }
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}

onMounted(async () => {
  sites.value = await contentClient.listSites()
  if (sites.value[0]) { siteId.value = sites.value[0].id }
})
watch(siteId, loadDraft)
</script>

<template>
  <section>
    <h1>Content</h1>
    <label>
      Site:
      <select v-model="siteId">
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.slug }} ({{ s.archetype }})</option>
      </select>
    </label>
    <p v-if="siteId" class="meta">Version {{ version }} · {{ published ? 'published' : 'draft' }}</p>
    <textarea v-model="draftJson" rows="24" spellcheck="false" />
    <div class="actions">
      <button type="button" @click="save(false)">Save draft</button>
      <button type="button" class="primary" @click="save(true)">Publish</button>
    </div>
    <p v-if="status" class="ok">{{ status }}</p>
    <p v-if="error" class="err">{{ error }}</p>
  </section>
</template>

<style scoped>
label { display: block; margin: 1rem 0; }
select { margin-left: 0.5rem; padding: 0.3rem 0.5rem; background: #1a1a1c; color: inherit; border: 1px solid #444; border-radius: 4px; }
.meta { color: #888; font-size: 0.85rem; }
textarea { width: 100%; font-family: ui-monospace, monospace; font-size: 0.85rem; background: #1a1a1c; color: #f5f5f5; border: 1px solid #2a2a2c; border-radius: 4px; padding: 0.75rem; }
.actions { margin-top: 1rem; display: flex; gap: 0.75rem; }
button { padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #444; background: transparent; color: inherit; cursor: pointer; }
button.primary { background: #f5f5f5; color: #0f0f10; border-color: #f5f5f5; font-weight: 600; }
.ok { color: #80ff80; margin-top: 0.5rem; }
.err { color: #ff8080; margin-top: 0.5rem; }
</style>
