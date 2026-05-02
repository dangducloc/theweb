<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title mono">Items</h1>
          <p class="page-sub">{{ meta.total || 0 }} items total</p>
        </div>
        <button v-if="auth.isAdmin" class="btn btn-primary" @click="openCreate">
          + New Item
        </button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input v-model="search" placeholder="Search items..." @input="debouncedLoad" style="max-width:260px" />
        <select v-model="filterCategory" @change="loadItems" style="max-width:180px">
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="card">
        <div v-if="loading" class="empty-state">Loading...</div>
        <div v-else-if="items.length === 0" class="empty-state">No items found</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="mono text-muted">{{ item.id }}</td>
                <td>
                  <div class="item-name">{{ item.name }}</div>
                  <div class="text-muted text-sm">{{ item.description }}</div>
                </td>
                <td><span class="badge badge-accent">{{ item.category?.name }}</span></td>
                <td class="text-muted">{{ item.location?.name }}</td>
                <td class="mono">{{ item.quantity }}</td>
                <td>
                  <span class="badge" :class="stockBadge(item)">{{ stockLabel(item) }}</span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-ghost btn-sm" @click="openBorrow(item)" :disabled="item.quantity <= 0">⇣ Borrow</button>
                    <button class="btn btn-ghost btn-sm" @click="openReturn(item)">⇡ Return</button>
                    <template v-if="auth.isAdmin">
                      <button class="btn btn-ghost btn-sm" @click="openEdit(item)">✎</button>
                      <button class="btn btn-danger btn-sm" @click="deleteItem(item)">✕</button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="meta.totalPages > 1">
          <button class="btn btn-ghost btn-sm" :disabled="page === 1" @click="page--; loadItems()">← Prev</button>
          <span class="mono text-muted text-sm">{{ page }} / {{ meta.totalPages }}</span>
          <button class="btn btn-ghost btn-sm" :disabled="page >= meta.totalPages" @click="page++; loadItems()">Next →</button>
        </div>
      </div>
    </div>

    <!-- Modal: Create/Edit Item -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title mono">{{ editingItem ? 'EDIT ITEM' : 'NEW ITEM' }}</span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input v-model="form.description" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity *</label>
              <input v-model.number="form.quantity" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label class="form-label">Min Quantity</label>
              <input v-model.number="form.minQuantity" type="number" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select v-model.number="form.categoryId" required>
              <option value="">Select category</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Location *</label>
            <select v-model.number="form.locationId" required>
              <option value="">Select location</option>
              <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </div>
          <div v-if="formError" class="form-error" style="margin-bottom:1rem">{{ formError }}</div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Borrow/Return -->
    <div v-if="showTxModal" class="modal-backdrop" @click.self="showTxModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title mono">{{ txType === 'borrow' ? '⇣ BORROW' : '⇡ RETURN' }}</span>
          <button class="modal-close" @click="showTxModal = false">✕</button>
        </div>
        <form @submit.prevent="submitTransaction">
          <div class="form-group">
            <label class="form-label">Item</label>
            <input :value="txItem?.name" disabled />
          </div>
          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input v-model.number="txQty" type="number" min="1" :max="txType === 'borrow' ? txItem?.quantity : 9999" required />
          </div>
          <div class="form-group">
            <label class="form-label">Note</label>
            <input v-model="txNote" placeholder="Optional note..." />
          </div>
          <div v-if="formError" class="form-error" style="margin-bottom:1rem">{{ formError }}</div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" @click="showTxModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Processing...' : 'Confirm' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth  = useAuthStore()
const toast = inject('toast')

const items      = ref([])
const categories = ref([])
const locations  = ref([])
const meta       = ref({})
const loading    = ref(true)
const search     = ref('')
const filterCategory = ref('')
const page       = ref(1)

// Item modal
const showModal   = ref(false)
const editingItem = ref(null)
const form        = ref({})
const formError   = ref('')
const saving      = ref(false)

// Transaction modal
const showTxModal = ref(false)
const txType      = ref('borrow')
const txItem      = ref(null)
const txQty       = ref(1)
const txNote      = ref('')

function stockBadge(item) {
  if (item.quantity === 0) return 'badge-danger'
  if (item.quantity <= item.minQuantity) return 'badge-warning'
  return 'badge-success'
}
function stockLabel(item) {
  if (item.quantity === 0) return 'Out'
  if (item.quantity <= item.minQuantity) return 'Low'
  return 'OK'
}

async function loadItems() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 15, search: search.value }
    if (filterCategory.value) params.categoryId = filterCategory.value
    const res = await api.get('/items', { params })
    items.value = res.data.data
    meta.value  = res.data.meta
  } finally {
    loading.value = false
  }
}

async function loadMeta() {
  const [catRes, locRes] = await Promise.all([
    api.get('/categories'),
    api.get('/locations'),
  ])
  categories.value = catRes.data.data
  locations.value  = locRes.data.data
}

let debounceTimer
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadItems() }, 400)
}

function openCreate() {
  editingItem.value = null
  form.value = { name: '', description: '', quantity: 0, minQuantity: 0, categoryId: '', locationId: '' }
  formError.value = ''
  showModal.value = true
}

function openEdit(item) {
  editingItem.value = item
  form.value = { name: item.name, description: item.description || '', quantity: item.quantity, minQuantity: item.minQuantity, categoryId: item.categoryId, locationId: item.locationId }
  formError.value = ''
  showModal.value = true
}

async function saveItem() {
  saving.value = true
  formError.value = ''
  try {
    if (editingItem.value) {
      await api.put(`/items/${editingItem.value.id}`, form.value)
      toast('Item updated', 'success')
    } else {
      await api.post('/items', form.value)
      toast('Item created', 'success')
    }
    showModal.value = false
    loadItems()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error saving item'
  } finally {
    saving.value = false
  }
}

async function deleteItem(item) {
  if (!confirm(`Delete "${item.name}"?`)) return
  try {
    await api.delete(`/items/${item.id}`)
    toast('Item deleted', 'success')
    loadItems()
  } catch (e) {
    toast(e.response?.data?.message || 'Error deleting', 'error')
  }
}

function openBorrow(item) {
  txType.value = 'borrow'; txItem.value = item; txQty.value = 1; txNote.value = ''; formError.value = ''; showTxModal.value = true
}
function openReturn(item) {
  txType.value = 'return'; txItem.value = item; txQty.value = 1; txNote.value = ''; formError.value = ''; showTxModal.value = true
}

async function submitTransaction() {
  saving.value = true
  formError.value = ''
  try {
    const endpoint = txType.value === 'borrow' ? '/transactions/borrow' : '/transactions/return'
    await api.post(endpoint, { itemId: txItem.value.id, quantity: txQty.value, note: txNote.value })
    toast(`${txType.value === 'borrow' ? 'Borrowed' : 'Returned'} successfully`, 'success')
    showTxModal.value = false
    loadItems()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error'
  } finally {
    saving.value = false
  }
}

onMounted(() => { loadItems(); loadMeta() })
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.3rem; font-weight: 700; letter-spacing: 0.08em; }
.page-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }

.filters { display: flex; gap: 0.75rem; }

.item-name { font-weight: 500; }

.action-btns { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  margin-top: 0.5rem;
}

.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.875rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
</style>