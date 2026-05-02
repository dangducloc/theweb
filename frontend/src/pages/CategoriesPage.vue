<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title mono">Categories</h1>
          <p class="page-sub">{{ categories.length }} categories</p>
        </div>
        <button v-if="auth.isAdmin" class="btn btn-primary" @click="openCreate">+ New</button>
      </div>

      <div class="card">
        <div v-if="loading" class="empty-state">Loading...</div>
        <div v-else-if="categories.length === 0" class="empty-state">No categories</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Items</th><th v-if="auth.isAdmin">Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td class="mono text-muted">{{ cat.id }}</td>
                <td>{{ cat.name }}</td>
                <td><span class="badge badge-accent">{{ cat._count?.items || 0 }}</span></td>
                <td v-if="auth.isAdmin">
                  <div class="action-btns">
                    <button class="btn btn-ghost btn-sm" @click="openEdit(cat)">✎ Edit</button>
                    <button class="btn btn-danger btn-sm" @click="deleteCategory(cat)">✕</button>
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
          <span class="modal-title mono">{{ editing ? 'EDIT CATEGORY' : 'NEW CATEGORY' }}</span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="save">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input v-model="form.name" required autofocus />
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

const categories = ref([])
const loading    = ref(true)
const showModal  = ref(false)
const editing    = ref(null)
const form       = ref({ name: '' })
const formError  = ref('')
const saving     = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data
  } finally { loading.value = false }
}

function openCreate() { editing.value = null; form.value = { name: '' }; formError.value = ''; showModal.value = true }
function openEdit(cat) { editing.value = cat; form.value = { name: cat.name }; formError.value = ''; showModal.value = true }

async function save() {
  saving.value = true; formError.value = ''
  try {
    if (editing.value) {
      await api.put(`/categories/${editing.value.id}`, form.value)
      toast('Category updated', 'success')
    } else {
      await api.post('/categories', form.value)
      toast('Category created', 'success')
    }
    showModal.value = false; load()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error'
  } finally { saving.value = false }
}

async function deleteCategory(cat) {
  if (!confirm(`Delete "${cat.name}"?`)) return
  try {
    await api.delete(`/categories/${cat.id}`)
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