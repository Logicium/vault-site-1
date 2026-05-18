<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const siteId = ref('')
const placeId = ref('')
const manual = ref({ author: '', rating: 5, text: '' })
const status = ref('')
const error = ref<string | null>(null)

async function savePlace() {
  status.value = ''; error.value = null
  try {
    await contentClient.setGooglePlace(siteId.value, placeId.value.trim())
    status.value = 'Saved. Reviews will refresh hourly.'
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function addManual() {
  status.value = ''; error.value = null
  try {
    await contentClient.addManualReview(siteId.value, { ...manual.value })
    status.value = 'Added.'
    manual.value = { author: '', rating: 5, text: '' }
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(async () => {
  sites.value = await contentClient.listSites()
  if (sites.value[0]) siteId.value = sites.value[0].id
})
watch(siteId, () => { status.value = ''; error.value = null })
</script>

<template>
  <section>
    <h1>Reviews</h1>
    <label>Site:
      <select v-model="siteId">
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.slug }}</option>
      </select>
    </label>

    <h2>Google Places</h2>
    <form @submit.prevent="savePlace">
      <input v-model="placeId" placeholder="ChIJ… (Google place ID)" />
      <button type="submit">Save</button>
    </form>

    <h2>Add a manual review</h2>
    <form @submit.prevent="addManual" class="manual">
      <input v-model="manual.author" placeholder="Author" required />
      <input v-model.number="manual.rating" type="number" min="1" max="5" required />
      <textarea v-model="manual.text" rows="3" placeholder="Review text" required />
      <button type="submit">Add</button>
    </form>

    <p v-if="status" class="ok">{{ status }}</p>
    <p v-if="error" class="err">{{ error }}</p>
  </section>
</template>

<style scoped>
label { display: block; margin: 1rem 0; }
select, input, textarea, button { padding: 0.4rem 0.6rem; background: #1a1a1c; color: inherit; border: 1px solid #444; border-radius: 4px; font: inherit; }
form { display: flex; flex-direction: column; gap: 0.5rem; max-width: 480px; margin: 0.5rem 0 1.5rem; }
form.manual textarea { resize: vertical; }
button { background: #f5f5f5; color: #0f0f10; cursor: pointer; font-weight: 500; }
h2 { margin-top: 1.5rem; }
.ok { color: #80ff80; }
.err { color: #ff8080; }
</style>
