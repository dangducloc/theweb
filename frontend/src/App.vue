<template>
  <router-view />
  <!-- Global Toast -->
  <div class="toast-wrap">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="`toast-${t.type}`"
    >
      <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }}</span>
      {{ t.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'

const toasts = ref([])

function showToast(message, type = 'info', duration = 3000) {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

provide('toast', showToast)
</script>