<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { contentClient } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const siteId = ref('')
const domain = ref('')
const dns = ref<{ instructions: Array<{ type: string; name: string; value: string; note: string }> } | null>(null)
const verifyStatus = ref('')
const error = ref<string | null>(null)

async function loadCurrent() {
  if (!siteId.value) return
  try {
    const r = await contentClient.getDomain(siteId.value)
    if (r.domain) domain.value = r.domain
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function request() {
  error.value = null; verifyStatus.value = ''
  try { dns.value = (await contentClient.requestDomain(siteId.value, domain.value.trim())).dns }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function verify() {
  error.value = null
  try {
    const r = await contentClient.verifyDomain(siteId.value)
    verifyStatus.value = r.ok ? 'Verified.' : 'Not yet — DNS may need more time.'
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(async () => {
  sites.value = await contentClient.listSites()
  if (sites.value[0]) siteId.value = sites.value[0].id
})
watch(siteId, loadCurrent)
</script>

<template>
  <section>
    <h1>Domain</h1>
    <label>Site:
      <select v-model="siteId">
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.slug }}</option>
      </select>
    </label>
    <form @submit.prevent="request">
      <input v-model="domain" placeholder="www.yoursite.com" />
      <button type="submit">Attach domain</button>
    </form>
    <div v-if="dns">
      <h2>DNS records</h2>
      <table>
        <thead><tr><th>Type</th><th>Name</th><th>Value</th><th>Note</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in dns.instructions" :key="i">
            <td>{{ r.type }}</td><td>{{ r.name }}</td><td>{{ r.value }}</td><td>{{ r.note }}</td>
          </tr>
        </tbody>
      </table>
      <button type="button" @click="verify">I've added the records — verify</button>
      <p v-if="verifyStatus" class="ok">{{ verifyStatus }}</p>
    </div>
    <p v-if="error" class="err">{{ error }}</p>
  </section>
</template>

<style scoped>
label { display: block; margin: 1rem 0; }
select, input, button { padding: 0.4rem 0.6rem; background: #1a1a1c; color: inherit; border: 1px solid #444; border-radius: 4px; font: inherit; }
form { display: flex; gap: 0.5rem; max-width: 480px; }
button { background: #f5f5f5; color: #0f0f10; cursor: pointer; font-weight: 500; }
table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid #2a2a2c; text-align: left; font-family: ui-monospace, monospace; font-size: 0.85rem; }
.ok { color: #80ff80; }
.err { color: #ff8080; }
</style>
