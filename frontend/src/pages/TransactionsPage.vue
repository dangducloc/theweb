<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title mono">Transactions</h1>
          <p class="page-sub">{{ meta.total || 0 }} total logs</p>
        </div>
        <div class="filters">
          <select v-model="filterType" @change="loadTx" style="max-width:150px">
            <option value="">All Types</option>
            <option value="BORROW">BORROW</option>
            <option value="RETURN">RETURN</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div v-if="loading" class="empty-state">Loading...</div>
        <div v-else-if="transactions.length === 0" class="empty-state">No transactions found</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Item</th>
                <th>Qty</th>
                <th>User</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td class="mono text-muted">{{ tx.id }}</td>
                <td>
                  <span class="badge" :class="tx.type === 'BORROW' ? 'badge-warning' : 'badge-success'">
                    {{ tx.type === 'BORROW' ? '⇣' : '⇡' }} {{ tx.type }}
                  </span>
                </td>
                <td>{{ tx.item?.name }}</td>
                <td class="mono">{{ tx.quantity }}</td>
                <td class="text-muted">{{ tx.user?.name }}</td>
                <td class="text-muted text-sm">{{ tx.note || '—' }}</td>
                <td class="mono text-muted text-sm">{{ formatDate(tx.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="meta.totalPages > 1">
          <button class="btn btn-ghost btn-sm" :disabled="page === 1" @click="page--; loadTx()">← Prev</button>
          <span class="mono text-muted text-sm">{{ page }} / {{ meta.totalPages }}</span>
          <button class="btn btn-ghost btn-sm" :disabled="page >= meta.totalPages" @click="page++; loadTx()">Next →</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import api from '@/services/api'

const transactions = ref([])
const meta         = ref({})
const loading      = ref(true)
const filterType   = ref('')
const page         = ref(1)

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { hour12: false })
}

async function loadTx() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20 }
    if (filterType.value) params.type = filterType.value
    const res = await api.get('/transactions', { params })
    transactions.value = res.data.data
    meta.value = res.data.meta
  } finally {
    loading.value = false
  }
}

onMounted(loadTx)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.3rem; font-weight: 700; letter-spacing: 0.08em; }
.page-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }
.filters { display: flex; gap: 0.75rem; align-items: center; }
.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.875rem; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); margin-top: 0.5rem; }
</style>