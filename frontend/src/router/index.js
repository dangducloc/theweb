// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginPage       from '@/pages/LoginPage.vue'
import DashboardPage   from '@/pages/DashboardPage.vue'
import ItemsPage       from '@/pages/ItemsPage.vue'
import TransactionsPage from '@/pages/TransactionsPage.vue'
import CategoriesPage  from '@/pages/CategoriesPage.vue'
import LocationsPage   from '@/pages/LocationsPage.vue'
import UsersPage       from '@/pages/UsersPage.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginPage, meta: { guest: true } },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  { path: '/dashboard',    name: 'Dashboard',    component: DashboardPage,    meta: { requiresAuth: true } },
  { path: '/items',        name: 'Items',        component: ItemsPage,        meta: { requiresAuth: true } },
  { path: '/transactions', name: 'Transactions', component: TransactionsPage, meta: { requiresAuth: true } },
  { path: '/categories',   name: 'Categories',   component: CategoriesPage,   meta: { requiresAuth: true } },
  { path: '/locations',    name: 'Locations',    component: LocationsPage,    meta: { requiresAuth: true } },
  { path: '/users',        name: 'Users',        component: UsersPage,        meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.guest && auth.isLoggedIn) return next('/dashboard')
  next()
})

export default router