<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-header">
        <span class="login-icon">▣</span>
        <h1 class="login-title mono">INVNT</h1>
        <p class="login-sub">Inventory Management System</p>
      </div>

      <!-- Tab switcher -->
      <div class="tab-switch">
        <button class="tab-btn" :class="{ active: mode === 'login' }" @click="mode = 'login'; error = ''">Sign In</button>
        <button class="tab-btn" :class="{ active: mode === 'register' }" @click="mode = 'register'; error = ''">Register</button>
      </div>

      <!-- LOGIN -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="loginForm.email" type="email" placeholder="admin@gmail.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="loginForm.password" type="password" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <div v-if="error" class="login-error">{{ error }}</div>
        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spin">◌</span>
          <span v-else>→</span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- REGISTER -->
      <form v-if="mode === 'register'" @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="registerForm.name" type="text" placeholder="Nguyen Van A" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="registerForm.email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="registerForm.password" type="password" placeholder="Min 8 chars, A-z, 0-9, @$!" required />
          <span class="form-hint">Uppercase + lowercase + number + special char</span>
        </div>
        <div class="form-group">
        <div v-if="error" class="login-error">{{ error }}</div>
          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            <span v-if="loading" class="spin">◌</span>
            <span v-else>✓</span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </div>
      </form>

      <div class="login-hint mono">sys/v1.0.0</div>
    </div>
    <div class="bg-grid" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()
const toast  = inject('toast')

const mode    = ref('login')
const loading = ref(false)
const error   = ref('')

const loginForm    = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(loginForm.value.email, loginForm.value.password)
    toast('Welcome back!', 'success')
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(registerForm.value)
    toast('Account created! Welcome', 'success')
    router.push('/dashboard')
  } catch (err) {
    const errors = err.response?.data?.errors
    if (errors?.length) {
      error.value = errors.map(e => e.message).join(', ')
    } else {
      error.value = err.response?.data?.message || 'Registration failed'
    }
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
  position: fixed; inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
  pointer-events: none;
}
.login-box {
  position: relative; z-index: 1;
  width: 100%; max-width: 400px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
}
.login-header { text-align: center; margin-bottom: 1.75rem; }
.login-icon { display: block; font-size: 2rem; color: var(--accent); margin-bottom: 0.5rem; }
.login-title { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.2em; color: var(--text-primary); margin-bottom: 0.3rem; }
.login-sub { font-size: 0.78rem; color: var(--text-muted); }

.tab-switch {
  display: flex;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 3px; gap: 3px;
  margin-bottom: 1.5rem;
}
.tab-btn {
  flex: 1; padding: 0.45rem;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.82rem; font-weight: 500;
  color: var(--text-muted);
  transition: all 0.18s;
  background: transparent; border: none; cursor: pointer;
}
.tab-btn.active { background: var(--accent); color: #fff; }

.login-form { display: flex; flex-direction: column; }
.login-error {
  background: var(--danger-dim); border: 1px solid var(--danger);
  color: var(--danger); padding: 0.6rem 0.9rem;
  border-radius: var(--radius); font-size: 0.82rem; margin-bottom: 1rem;
}
.form-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
.login-btn { width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.9rem; margin-top: 0.5rem; }
.login-hint { text-align: center; font-size: 0.68rem; color: var(--text-muted); margin-top: 1.5rem; letter-spacing: 0.05em; }
</style>