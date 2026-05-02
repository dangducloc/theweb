<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title mono">Locations</h1>
          <p class="page-sub">{{ locations.length }} locations</p>
        </div>
        <button v-if="auth.isAdmin" class="btn btn-primary" @click="openCreate">+ New</button>
      </div>

      <div class="card">
        <div v-if="loading" class="empty-state">Loading...</div>
        <div v-else-if="locations.length === 0" class="empty-state">No locations</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Address</th><th>Items</th><th v-if="auth.isAdmin">Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="loc in locations" :key="loc.id">
                <td class="mono text-muted">{{ loc.id }}</td>
                <td>{{ loc.name }}</td>
                <td class="text-muted">{{ loc.address || '—' }}</td>
                <td><span class="badge badge-accent">{{ loc._count?.items || 0 }}</span></td>
                <td v-if="auth.isAdmin">
                  <div class="action-btns">
                    <button class="btn btn-ghost btn-sm" @click="openEdit(loc)">✎ Edit</button>
                    <button class="btn btn-danger btn-sm" @click="deleteLocation(loc)">✕</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title mono">{{ editing ? 'EDIT LOCATION' : 'NEW LOCATION' }}</span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="save">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input v-model="form.name" required autofocus />
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input v-model="form.address" placeholder="Optional address..." />
          </div>
          <div v-if="formError" class="form-error" style="margin-bottom:1rem">{{ formError }}</div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
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

const locations = ref([])
const loading   = ref(true)
const showModal = ref(false)
const editing   = ref(null)
const form      = ref({ name: '', address: '' })
const formError = ref('')
const saving    = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/locations')
    locations.value = res.data.data
  } finally { loading.value = false }
}

function openCreate() { editing.value = null; form.value = { name: '', address: '' }; formError.value = ''; showModal.value = true }
function openEdit(loc) { editing.value = loc; form.value = { name: loc.name, address: loc.address || '' }; formError.value = ''; showModal.value = true }

async function save() {
  saving.value = true; formError.value = ''
  try {
    if (editing.value) {
      await api.put(`/locations/${editing.value.id}`, form.value)
      toast('Location updated', 'success')
    } else {
      await api.post('/locations', form.value)
      toast('Location created', 'success')
    }
    showModal.value = false; load()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error'
  } finally { saving.value = false }
}

async function deleteLocation(loc) {
  if (!confirm(`Delete "${loc.name}"?`)) return
  try {
    await api.delete(`/locations/${loc.id}`)
    toast('Deleted', 'success'); load()
  } catch (e) {
    toast(e.response?.data?.message || 'Cannot delete', 'error')
  }
}

onMounted(load)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.3rem; font-weight: 700; letter-spacing: 0.08em; }
.page-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }
.action-btns { display: flex; gap: 0.35rem; }
.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.875rem; }
</style>