// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => user.value?.role === 'ADMIN')

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data.data
    token.value = t
    user.value  = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    return u
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload)
    const { token: t, user: u } = res.data.data
    token.value = t
    user.value  = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    return u
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, isAdmin, login, register, logout }
})