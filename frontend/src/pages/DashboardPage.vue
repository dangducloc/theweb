<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title mono">Dashboard</h1>
          <p class="page-sub">System overview</p>
        </div>
        <div class="mono text-muted text-sm">{{ currentTime }}</div>
      </div>

      <!-- Stat cards -->
      <div class="stats-grid">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <div class="stat-icon">{{ s.icon }}</div>
          <div class="stat-value mono">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Low stock alert -->
      <div v-if="lowStock.length > 0" class="alert-box">
        <div class="alert-title">
          <span>⚠</span>
          <span class="mono">LOW STOCK ALERT</span>
          <span class="badge badge-warning">{{ lowStock.length }}</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Min</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStock" :key="item.id">
                <td>{{ item.name }}</td>
                <td><span class="badge badge-accent">{{ item.category?.name }}</span></td>
                <td><span class="badge badge-danger">{{ item.quantity }}</span></td>
                <td class="text-muted">{{ item.minQuantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent transactions -->
      <div class="card">
        <div class="section-header">
          <h2 class="section-title mono">Recent Transactions</h2>
        </div>
        <div v-if="loadingTx" class="loading-state">Loading...</div>
        <div v-else-if="recentTx.length === 0" class="empty-state">No transactions yet</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Item</th>
                <th>Qty</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in recentTx" :key="tx.id">
                <td class="mono text-muted">{{ tx.id }}</td>
                <td>
                  <span class="badge" :class="tx.type === 'BORROW' ? 'badge-warning' : 'badge-success'">
                    {{ tx.type }}
                  </span>
                </td>
                <td>{{ tx.item?.name }}</td>
                <td class="mono">{{ tx.quantity }}</td>
                <td class="text-muted">{{ tx.user?.name }}</td>
                <td class="mono text-muted text-sm">{{ formatDate(tx.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import api from '@/services/api'

const stats      = ref([])
const lowStock   = ref([])
const recentTx   = ref([])
const loadingTx  = ref(true)
const currentTime = ref('')

function tick() {
  currentTime.value = new Date().toLocaleString('en-GB', { hour12: false })
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB')
}

async function loadData() {
  try {
    const [itemsRes, txRes] = await Promise.all([
      api.get('/items?limit=100'),
      api.get('/transactions?limit=10'),
    ])

    const items = itemsRes.data.data
    recentTx.value = txRes.data.data
    loadingTx.value = false

    const borrowCount  = txRes.data.meta?.total || 0
    lowStock.value = items.filter(i => i.quantity <= i.minQuantity)

    stats.value = [
      { icon: '◧', label: 'Total Items',    value: itemsRes.data.meta?.total || items.length },
      { icon: '⚠', label: 'Low Stock',      value: lowStock.value.length },
      { icon: '⇄', label: 'Transactions',   value: borrowCount },
      { icon: '✓', label: 'In Stock',       value: items.filter(i => i.quantity > 0).length },
    ]
  } catch (e) {
    loadingTx.value = false
    console.error(e)
  }
}

onMounted(() => {
  loadData()
  tick()
  setInterval(tick, 1000)
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.page-title { font-size: 1.3rem; font-weight: 700; letter-spacing: 0.08em; }
.page-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.stat-icon  { font-size: 1.2rem; color: var(--accent); }
.stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.alert-box {
  background: var(--warning-dim);
  border: 1px solid var(--warning);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
}
.alert-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--warning);
  margin-bottom: 1rem;
}

.section-header { margin-bottom: 1rem; }
.section-title  { font-size: 0.85rem; letter-spacing: 0.08em; color: var(--text-secondary); }

.loading-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>