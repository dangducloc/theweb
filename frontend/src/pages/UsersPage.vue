<template>
  <AppLayout>
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title mono">Users</h1>
          <p class="page-sub">{{ meta.total || users.length }} accounts</p>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ New User</button>
      </div>

      <!-- Search -->
      <div class="filters">
        <input v-model="search" placeholder="Search name or email..." @input="debouncedLoad" style="max-width:280px" />
        <select v-model="filterRole" @change="loadUsers" style="max-width:150px">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
        </select>
      </div>

      <div class="card">
        <div v-if="loading" class="empty-state">Loading...</div>
        <div v-else-if="users.length === 0" class="empty-state">No users found</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" :class="{ 'row-me': u.id === auth.user?.id }">
                <td class="mono text-muted">{{ u.id }}</td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-sm">{{ u.name[0].toUpperCase() }}</div>
                    <span>{{ u.name }}</span>
                    <span v-if="u.id === auth.user?.id" class="badge badge-accent" style="font-size:0.65rem">you</span>
                  </div>
                </td>
                <td class="mono text-muted" style="font-size:0.82rem">{{ u.email }}</td>
                <td>
                  <span class="badge" :class="u.role === 'ADMIN' ? 'badge-warning' : 'badge-accent'">
                    {{ u.role }}
                  </span>
                </td>
                <td class="mono text-muted text-sm">{{ formatDate(u.createdAt) }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-ghost btn-sm" @click="openEdit(u)">✎ Edit</button>
                    <button
                      class="btn btn-danger btn-sm"
                      @click="deleteUser(u)"
                      :disabled="u.id === auth.user?.id"
                      :title="u.id === auth.user?.id ? 'Cannot delete yourself' : ''"
                    >✕</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title mono">{{ editing ? 'EDIT USER' : 'NEW USER' }}</span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="save">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input v-model="form.name" required placeholder="Nguyen Van A" />
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="form.email" type="email" required placeholder="user@example.com" :disabled="!!editing" />
            <span v-if="editing" class="form-hint">Email cannot be changed</span>
          </div>
          <div class="form-group">
            <label class="form-label">{{ editing ? 'New Password' : 'Password *' }}</label>
            <input
              v-model="form.password"
              type="password"
              :required="!editing"
              placeholder="Min 8 chars, A-z, 0-9, @$!"
            />
            <span v-if="editing" class="form-hint">Leave blank to keep current password</span>
            <span v-else class="form-hint">Uppercase + lowercase + number + special char</span>
          </div>
          <div class="form-group">
            <label class="form-label">Role *</label>
            <select v-model="form.role" required>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
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
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth  = useAuthStore()
const toast = inject('toast')

const users      = ref([])
const meta       = ref({})
const loading    = ref(true)
const search     = ref('')
const filterRole = ref('')

const showModal = ref(false)
const editing   = ref(null)
const form      = ref({ name: '', email: '', password: '', role: 'STAFF' })
const formError = ref('')
const saving    = ref(false)

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB')
}

async function loadUsers() {
  loading.value = true
  try {
    const params = {}
    if (search.value)     params.search = search.value
    if (filterRole.value) params.role   = filterRole.value
    const res = await api.get('/users', { params })
    users.value = res.data.data
    meta.value  = res.data.meta || {}
  } catch (e) {
    toast('Failed to load users', 'error')
  } finally {
    loading.value = false
  }
}

let debounceTimer
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadUsers, 400)
}

function openCreate() {
  editing.value   = null
  form.value      = { name: '', email: '', password: '', role: 'STAFF' }
  formError.value = ''
  showModal.value = true
}

function openEdit(u) {
  editing.value   = u
  form.value      = { name: u.name, email: u.email, password: '', role: u.role }
  formError.value = ''
  showModal.value = true
}

async function save() {
  saving.value    = true
  formError.value = ''
  try {
    if (editing.value) {
      // Only send changed fields
      const payload = { name: form.value.name, role: form.value.role }
      if (form.value.password) payload.password = form.value.password
      await api.put(`/users/${editing.value.id}`, payload)
      toast('User updated', 'success')
    } else {
      await api.post('/users', form.value)
      toast('User created', 'success')
    }
    showModal.value = false
    loadUsers()
  } catch (e) {
    const errors = e.response?.data?.errors
    if (errors?.length) {
      formError.value = errors.map(err => err.message).join(', ')
    } else {
      formError.value = e.response?.data?.message || 'Error saving user'
    }
  } finally {
    saving.value = false
  }
}

async function deleteUser(u) {
  if (u.id === auth.user?.id) return
  if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return
  try {
    await api.delete(`/users/${u.id}`)
    toast('User deleted', 'success')
    loadUsers()
  } catch (e) {
    toast(e.response?.data?.message || 'Cannot delete user', 'error')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.3rem; font-weight: 700; letter-spacing: 0.08em; }
.page-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }

.filters { display: flex; gap: 0.75rem; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.user-avatar-sm {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent-hover);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.row-me { background: rgba(99,102,241,0.04); }

.action-btns { display: flex; gap: 0.35rem; }
.form-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.875rem; }
</style>