<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const siteId = ref('')
const connectUrl = ref<string | null>(null)
const error = ref<string | null>(null)

async function loadConnect() {
  if (!siteId.value) return
  try { connectUrl.value = (await contentClient.getInstagramConnect(siteId.value)).url }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function disconnect() {
  await contentClient.disconnectInstagram(siteId.value)
  await loadConnect()
}
onMounted(async () => {
  sites.value = await contentClient.listSites()
  if (sites.value[0]) siteId.value = sites.value[0].id
})
watch(siteId, loadConnect)
</script>

<template>
  <section>
    <h1>Instagram</h1>
    <label>Site:
      <select v-model="siteId">
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.slug }}</option>
      </select>
    </label>
    <p v-if="connectUrl">
      <a :href="connectUrl" class="btn">Connect Instagram</a>
      <button type="button" @click="disconnect">Disconnect</button>
    </p>
    <p v-if="error" class="err">{{ error }}</p>
  </section>
</template>

<style scoped>
label { display: block; margin: 1rem 0; }
select, button, .btn { padding: 0.4rem 0.8rem; background: #1a1a1c; color: inherit; border: 1px solid #444; border-radius: 4px; text-decoration: none; cursor: pointer; }
.btn { background: #f5f5f5; color: #0f0f10; font-weight: 500; margin-right: 0.5rem; }
.err { color: #ff8080; }
</style>
