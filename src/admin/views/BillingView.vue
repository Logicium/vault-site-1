<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { contentClient } from '../../platform/contentClient'

const orders = ref<Awaited<ReturnType<typeof contentClient.listOrders>>>([])
const error = ref<string | null>(null)

async function load() {
  try { orders.value = await contentClient.listOrders() }
  catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function retry(id: string) {
  await contentClient.retryOrder(id)
  await load()
}
onMounted(load)
</script>

<template>
  <section>
    <h1>Billing &amp; orders</h1>
    <p v-if="error" class="err">{{ error }}</p>
    <table v-if="orders.length">
      <thead><tr><th>Created</th><th>Archetype</th><th>Plan</th><th>Status</th><th>Notes</th><th /></tr></thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>{{ new Date(o.createdAt).toLocaleString() }}</td>
          <td>{{ o.archetype }}</td>
          <td>{{ o.plan }}</td>
          <td>{{ o.status }}</td>
          <td>{{ o.failureReason || '' }}</td>
          <td><button v-if="o.status === 'failed'" type="button" @click="retry(o.id)">Retry</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else>No orders yet.</p>
  </section>
</template>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid #2a2a2c; text-align: left; }
button { padding: 0.25rem 0.6rem; background: transparent; color: inherit; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
.err { color: #ff8080; }
</style>
