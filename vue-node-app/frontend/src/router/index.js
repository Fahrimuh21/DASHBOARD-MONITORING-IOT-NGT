import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: '/verify-email',
      name: 'verifyEmail',
      component: () => import('../views/auth/VerifyEmailView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('../views/MonitoringView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/connect-device',
      name: 'connectDevice',
      component: () => import('../views/ConnectDeviceView.vue'),
      meta: { requiresAuth: true, requiresPatient: true }
    },
    {
      path: '/admin/devices',
      name: 'adminDevices',
      component: () => import('../views/admin/DevicesView.vue'),
      meta: { requiresAuth: true, requiresNurse: true }
    },
    {
      path: '/admin/device/create',
      name: 'adminDeviceCreate',
      component: () => import('../views/admin/DeviceCreateView.vue'),
      meta: { requiresAuth: true, requiresNurse: true }
    },
    {
      path: '/admin/device/:id/edit',
      name: 'adminDeviceEdit',
      component: () => import('../views/admin/DeviceEditView.vue'),
      meta: { requiresAuth: true, requiresNurse: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  const isAuthenticated = !!authStore.user
  const isNurse = authStore.user?.role === 'PERAWAT'
  const isPatient = authStore.user?.role === 'PASIEN'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.requiresNurse && !isNurse) {
    next('/dashboard')
  } else if (to.meta.requiresPatient && !isPatient) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
