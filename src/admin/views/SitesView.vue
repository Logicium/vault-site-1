<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { contentClient } from '../../platform/contentClient'
import { getStoredToken } from '../../platform/contentClient'

const sites = ref<Awaited<ReturnType<typeof contentClient.listSites>>>([])
const loading = ref(false)
const error = ref<string | null>(null)
const redeploying = ref<Record<string, boolean>>({})
const redeployMsg = ref<Record<string, string>>({})
const updateStatus = ref<Record<string, { current: string | null; latest: string | null; hasUpdate: boolean; neverChecked?: boolean } | null>>({})
const updateChecking = ref<Record<string, boolean>>({})
const updating = ref<Record<string, boolean>>({})
const updateMsg = ref<Record<string, string>>({})

// Per-site screenshot blob URLs. We load them via fetch (adding the auth header)
// so the guarded endpoint accepts the request. Blob URLs are cached in memory;
// we also store the server URL as the src key so we only fetch once per load.
const screenshotBlob = ref<Record<string, string | null>>({})
const screenshotErr = ref<Record<string, boolean>>({})

async function loadScreenshot(siteId: string) {
  screenshotErr.value[siteId] = false
  try {
    const url = contentClient.screenshotUrl(siteId)
    const token = getStoredToken()
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) { screenshotErr.value[siteId] = true; return }
    const blob = await res.blob()
    // Revoke any previous blob URL to avoid memory leaks
    const prev = screenshotBlob.value[siteId]
    if (prev) URL.revokeObjectURL(prev)
    screenshotBlob.value[siteId] = URL.createObjectURL(blob)
  } catch {
    screenshotErr.value[siteId] = true
  }
}

async function refreshScreenshot(siteId: string) {
  screenshotBlob.value[siteId] = null
  screenshotErr.value[siteId] = false
  try {
    const url = contentClient.screenshotUrl(siteId, true)
    const token = getStoredToken()
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) { screenshotErr.value[siteId] = true; return }
    const blob = await res.blob()
    const prev = screenshotBlob.value[siteId]
    if (prev) URL.revokeObjectURL(prev)
    screenshotBlob.value[siteId] = URL.createObjectURL(blob)
  } catch {
    screenshotErr.value[siteId] = true
  }
}

async function redeploy(siteId: string) {
  redeploying.value[siteId] = true
  redeployMsg.value[siteId] = ''
  try {
    const r = await contentClient.redeploySite(siteId)
    redeployMsg.value[siteId] = `Triggered (${r.deploymentId})`
  } catch (e) {
    redeployMsg.value[siteId] = e instanceof Error ? e.message : String(e)
  } finally {
    redeploying.value[siteId] = false
  }
}

async function checkUpdate(siteId: string) {
  updateChecking.value[siteId] = true
  updateMsg.value[siteId] = ''
  try {
    updateStatus.value[siteId] = await contentClient.getUpdateStatus(siteId)
  } catch (e) {
    updateMsg.value[siteId] = e instanceof Error ? e.message : String(e)
  } finally {
    updateChecking.value[siteId] = false
  }
}

async function updateNow(siteId: string) {
  updating.value[siteId] = true
  updateMsg.value[siteId] = ''
  try {
    const r = await contentClient.updateSite(siteId)
    updateMsg.value[siteId] = `Update queued (${r.jobId})`
  } catch (e) {
    updateMsg.value[siteId] = e instanceof Error ? e.message : String(e)
  } finally {
    updating.value[siteId] = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    sites.value = await contentClient.listSites()
    for (const s of sites.value) {
      if (liveUrl(s)) {
        void checkUpdate(s.id)
        void loadScreenshot(s.id)
      }
    }
  }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
  finally { loading.value = false }
})

function liveUrl(s: { customDomain?: string; productionUrl?: string }) {
  return s.customDomain ? `https://${s.customDomain}` : s.productionUrl ?? ''
}
function displayHost(url: string) {
  try { return new URL(url).host } catch { return url.replace(/^https?:\/\//, '') }
}

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (s === 'live' || s === 'ready') return 'adm-badge--live'
  if (s === 'failed') return 'adm-badge--failed'
  if (s === 'provisioning' || s === 'pending' || s === 'queued' || s === 'building') return 'adm-badge--pending'
  return 'adm-badge--info'
}

const liveCount = computed(() => sites.value.filter(s => liveUrl(s)).length)
</script>

<template>
  <section class="adm-page">
    <header class="adm-page__head">
      <div class="adm-page__title-block">
        <span class="adm-eyebrow">Studio</span>
        <h1 class="adm-title">Your sites</h1>
        <p class="adm-subtitle">
          <template v-if="loading">Loading…</template>
          <template v-else-if="!sites.length">Nothing here yet — your first site will appear once it’s provisioned.</template>
          <template v-else>{{ liveCount }} of {{ sites.length }} live · click a card to open it in a new tab.</template>
        </p>
      </div>
    </header>

    <p v-if="error" class="adm-msg-err">{{ error }}</p>

    <div v-if="sites.length" class="site-grid">
      <article v-for="s in sites" :key="s.id" class="site-card">
        <a
          v-if="liveUrl(s)"
          :href="liveUrl(s)"
          target="_blank"
          rel="noopener"
          class="site-card__preview"
          :title="`Open ${s.slug} in a new tab`"
        >
          <img
            v-if="screenshotBlob[s.id]"
            :src="screenshotBlob[s.id]!"
            :alt="`${s.slug} preview`"
          />
          <div v-else-if="screenshotErr[s.id]" class="site-card__placeholder">
            <span>Preview unavailable</span>
          </div>
          <div v-else class="site-card__placeholder site-card__placeholder--loading">
            <span class="site-card__spinner" />
          </div>
          <span class="site-card__open-hint">Open ↗</span>
        </a>
        <div v-else class="site-card__preview site-card__preview--empty">
          <div class="site-card__placeholder"><span>Not deployed</span></div>
        </div>

        <div class="site-card__body">
          <div class="site-card__top">
            <span class="adm-eyebrow">{{ s.archetype }}</span>
            <span class="adm-badge" :class="statusClass(s.status)">{{ s.status }}</span>
          </div>
          <h2 class="site-card__title">{{ s.slug }}</h2>
          <a v-if="liveUrl(s)" :href="liveUrl(s)" target="_blank" rel="noopener" class="adm-link site-card__url">
            {{ displayHost(liveUrl(s)) }}
          </a>
          <span v-else class="adm-subtle">No URL yet</span>

          <div class="site-card__update">
            <template v-if="liveUrl(s)">
              <span v-if="updateChecking[s.id]" class="adm-muted">Checking for updates…</span>
              <template v-else-if="updateStatus[s.id]">
                <span v-if="updateStatus[s.id]!.hasUpdate" class="adm-msg-warn">● Update available</span>
                <span v-else-if="updateStatus[s.id]!.neverChecked" class="adm-muted">● Status unknown</span>
                <span v-else class="adm-msg-ok">● Up to date</span>
              </template>
            </template>
          </div>

          <div class="site-card__actions">
            <button
              v-if="liveUrl(s)"
              type="button" class="adm-btn adm-btn--sm"
              :disabled="updateChecking[s.id]"
              @click="checkUpdate(s.id)"
            >Check</button>
            <button
              v-if="liveUrl(s) && (updateStatus[s.id]?.hasUpdate || updateStatus[s.id]?.neverChecked)"
              type="button" class="adm-btn adm-btn--sm adm-btn--primary"
              :disabled="updating[s.id]"
              @click="updateNow(s.id)"
            >{{ updating[s.id] ? 'Queuing…' : 'Update' }}</button>
            <button
              v-if="liveUrl(s)"
              type="button" class="adm-btn adm-btn--sm"
              :disabled="redeploying[s.id]"
              @click="redeploy(s.id)"
            >{{ redeploying[s.id] ? 'Triggering…' : 'Redeploy' }}</button>
            <button
              v-if="liveUrl(s)"
              type="button" class="adm-btn adm-btn--sm adm-btn--ghost"
              :title="'Refresh screenshot'"
              @click="refreshScreenshot(s.id)"
            >⟳ Screenshot</button>
          </div>

          <p v-if="redeployMsg[s.id]" class="adm-muted site-card__msg">{{ redeployMsg[s.id] }}</p>
          <p v-if="updateMsg[s.id]" class="adm-muted site-card__msg">{{ updateMsg[s.id] }}</p>
        </div>
      </article>
    </div>

    <div v-else-if="!loading && !error" class="adm-empty">
      <div class="adm-empty__icon">◇</div>
      <h2 class="adm-empty__title">No sites yet</h2>
      <p class="adm-empty__body">Your sites will appear here as they finish provisioning.</p>
    </div>
  </section>
</template>

<style scoped>
.site-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.site-card {
  display: flex; flex-direction: column;
  background: var(--adm-surface);
  border: 1px solid var(--adm-border);
  border-radius: var(--adm-radius-lg);
  overflow: hidden;
  box-shadow: var(--adm-shadow);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}
.site-card:hover {
  transform: translateY(-2px);
  border-color: var(--adm-accent-deep);
  box-shadow: var(--adm-shadow-lg);
}

.site-card__preview {
  position: relative; display: block;
  aspect-ratio: 16 / 10;
  background: var(--adm-surface-2);
  overflow: hidden;
  border-bottom: 1px solid var(--adm-border);
}
.site-card__preview img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 600ms ease;
}
.site-card:hover .site-card__preview img { transform: scale(1.03); }

.site-card__placeholder {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  background:
    linear-gradient(135deg, rgba(196,164,124,0.08) 0%, transparent 50%),
    repeating-linear-gradient(45deg, var(--adm-surface-2) 0 8px, var(--adm-surface) 8px 16px);
  color: var(--adm-text-subtle);
  font-size: 0.85rem; letter-spacing: 0.05em;
}
.site-card__preview--empty { pointer-events: none; }

.site-card__open-hint {
  position: absolute; top: 0.6rem; right: 0.6rem;
  padding: 0.25rem 0.55rem;
  background: rgba(10,11,13,0.7);
  border: 1px solid var(--adm-border-strong);
  color: var(--adm-text);
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em;
  border-radius: 999px;
  opacity: 0; transition: opacity 180ms;
  backdrop-filter: blur(6px);
}
.site-card__preview:hover .site-card__open-hint { opacity: 1; }

.site-card__body {
  padding: 1rem 1.1rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.4rem;
}
.site-card__top { display: flex; justify-content: space-between; align-items: center; }

.site-card__title {
  font-family: var(--adm-font-serif);
  font-size: 1.5rem; font-weight: 500;
  letter-spacing: -0.01em; line-height: 1.1;
  margin: 0.1rem 0 0;
  color: var(--adm-text);
}
.site-card__url {
  font-size: 0.82rem; word-break: break-all;
}
.site-card__update { font-size: 0.78rem; margin-top: 0.25rem; min-height: 1.1em; }
.site-card__actions { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.6rem; }
.site-card__msg { font-size: 0.78rem; margin: 0.3rem 0 0; }

.site-card__placeholder--loading {
  background: var(--adm-surface-2);
}
.site-card__spinner {
  display: block;
  width: 28px; height: 28px;
  border: 2px solid color-mix(in srgb, var(--adm-accent) 30%, transparent);
  border-top-color: var(--adm-accent);
  border-radius: 50%;
  animation: sc-spin 900ms linear infinite;
}
@keyframes sc-spin { to { transform: rotate(360deg); } }
</style>
