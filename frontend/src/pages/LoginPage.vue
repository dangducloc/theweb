<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-header">
        <span class="login-icon">▣</span>
        <h1 class="login-title mono">INVNT</h1>
        <p class="login-sub">Inventory Management System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@gmail.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spin">◌</span>
          <span v-else>→</span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="login-hint mono">
        <span>sys/</span>v1.0.0
      </div>
    </div>

    <!-- Background grid -->
    <div class="bg-grid" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth    = useAuthStore()
const router  = useRouter()
const toast   = inject('toast')

const form    = ref({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    toast('Welcome back!', 'success')
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
  pointer-events: none;
}

.login-box {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}
.login-icon {
  display: block;
  font-size: 2rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}
.login-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.login-form { display: flex; flex-direction: column; }

.login-error {
  background: var(--danger-dim);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius);
  font-size: 0.82rem;
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.login-hint {
  text-align: center;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 1.5rem;
  letter-spacing: 0.05em;
}
</style>