<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { contentClient } from '../../platform/contentClient'

type Order = Awaited<ReturnType<typeof contentClient.listOrders>>[number]
type LogEntry = { step: string; status: string; message?: string; durationMs?: number; createdAt: string }

const orders = ref<Order[]>([])
const error = ref<string | null>(null)
const expandedSite = ref<string | null>(null)
const logs = ref<LogEntry[]>([])
const logsError = ref<string | null>(null)

async function load() {
  try { orders.value = await contentClient.listOrders() }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function retry(id: string) {
  await contentClient.retryOrder(id)
  await load()
}
async function toggleLogs(siteId: string) {
  if (expandedSite.value === siteId) { expandedSite.value = null; return }
  expandedSite.value = siteId
  logsError.value = null
  try { logs.value = await contentClient.getDeployLogs(siteId) }
  catch (e) { logsError.value = e instanceof Error ? e.message : String(e) }
}
onMounted(load)
</script>

<template>
  <section class="adm-page">
    <header class="adm-page__head">
      <div>
        <span class="adm-eyebrow">Account</span>
        <h1 class="adm-title">Billing &amp; orders</h1>
        <p class="adm-subtitle">Every site you’ve launched and its deployment history.</p>
      </div>
    </header>

    <p v-if="error" class="adm-msg-err">{{ error }}</p>

    <div v-if="!orders.length" class="adm-empty">
      <p class="adm-empty__body">No orders yet.</p>
    </div>
    <div v-else class="adm-card bl-card">
      <div class="bl-table-wrap">
        <table class="adm-table bl-table">
          <thead>
            <tr><th>Created</th><th>Archetype</th><th>Plan</th><th>Status</th><th>Notes</th><th /></tr>
          </thead>
          <tbody>
            <template v-for="o in orders" :key="o.id">
              <tr>
                <td class="adm-muted">{{ new Date(o.createdAt).toLocaleString() }}</td>
                <td>{{ o.archetype }}</td>
                <td>{{ o.plan }}</td>
                <td>
                  <span
                    class="adm-badge"
                    :class="{
                      'adm-badge--live': o.status === 'live',
                      'adm-badge--failed': o.status === 'failed',
                      'adm-badge--pending': o.status !== 'live' && o.status !== 'failed',
                    }"
                  >{{ o.status }}</span>
                </td>
                <td class="adm-muted">{{ o.failureReason || '' }}</td>
                <td class="bl-actions">
                  <button
                    v-if="o.siteId"
                    type="button"
                    class="adm-btn adm-btn--ghost adm-btn--sm"
                    @click="toggleLogs(o.siteId!)"
                  >{{ expandedSite === o.siteId ? 'Hide logs' : 'Logs' }}</button>
                  <button
                    v-if="o.status === 'failed'"
                    type="button"
                    class="adm-btn adm-btn--danger adm-btn--sm"
                    @click="retry(o.id)"
                  >Retry</button>
                </td>
              </tr>
              <tr v-if="expandedSite === o.siteId" class="bl-log-row">
                <td colspan="6">
                  <p v-if="logsError" class="adm-msg-err">{{ logsError }}</p>
                  <table v-else-if="logs.length" class="adm-table bl-log-table">
                    <thead><tr><th>Step</th><th>Status</th><th>Duration</th><th>Message</th></tr></thead>
                    <tbody>
                      <tr v-for="l in logs" :key="l.createdAt + l.step" :class="{ 'is-fail': l.status === 'failure' }">
                        <td>{{ l.step }}</td>
                        <td>{{ l.status }}</td>
                        <td class="adm-muted">{{ l.durationMs != null ? l.durationMs + 'ms' : '—' }}</td>
                        <td class="bl-log-msg">{{ l.message || '' }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else class="adm-muted">No deploy logs yet.</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bl-card { padding: 0; overflow: hidden; }
.bl-table-wrap { overflow-x: auto; }
.bl-table { min-width: 720px; }
.bl-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
.bl-log-row > td { background: var(--adm-surface-3); padding: 0.85rem 1rem; }
.bl-log-table { font-size: 0.82rem; margin: 0; }
.bl-log-table tr.is-fail td { color: var(--adm-danger); }
.bl-log-msg { max-width: 500px; white-space: pre-wrap; word-break: break-all; font-family: var(--adm-font-mono); font-size: 0.78rem; }
</style>
