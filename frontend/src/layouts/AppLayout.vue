<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">▣</span>
        <span class="brand-name mono">INVNT</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: $route.path === item.to }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role mono">{{ auth.user?.role }}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="handleLogout">⏻</button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

const userInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || 'U')

const navItems = [
  { to: '/dashboard',    icon: '◈', label: 'Dashboard' },
  { to: '/items',        icon: '◧', label: 'Items' },
  { to: '/transactions', icon: '⇄', label: 'Transactions' },
  { to: '/categories',   icon: '⊞', label: 'Categories' },
  { to: '/locations',    icon: '◎', label: 'Locations' },
  { to: '/users',        icon: '◉', label: 'Users' },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ── */
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
}
.brand-icon {
  font-size: 1.4rem;
  color: var(--accent);
}
.brand-name {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.nav-item:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--accent-dim);
  color: var(--accent-hover);
}
.nav-icon { font-size: 1rem; width: 20px; text-align: center; }

.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-info { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
.user-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent-hover);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.user-meta { min-width: 0; }
.user-name { font-size: 0.82rem; font-weight: 500; truncate: true; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.68rem; color: var(--text-muted); letter-spacing: 0.06em; }

/* ── Main ── */
.main-content {
  margin-left: 220px;
  flex: 1;
  padding: 2rem;
  min-height: 100vh;
}
</style>