<template>
  <nav class="navbar app-navbar" aria-label="Navigasi utama">
    <div class="app-navbar-inner" style="display: flex; align-items: center; justify-content: space-between;">
      <router-link to="/dashboard" class="navbar-brand">
        <span class="navbar-brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo NGT-Safe CO2" />
        </span>
        <span>
          <span class="navbar-brand-title">NGT-Safe CO2</span>
          <span class="navbar-brand-subtitle">{{ authStore.user?.role === 'PERAWAT' ? 'Perawat' : 'Realtime CO₂ Sensing' }}</span>
        </span>
      </router-link>

      <ul class="navbar-links" role="list" style="display: flex; gap: 8px; list-style: none; margin: 0; padding: 0;">
        <li class="navbar-link-item" v-for="item in navItems" :key="item.key">
          <router-link :to="item.href" class="nav-link" active-class="active" style="display: flex; align-items: center; gap: 6px;">
            <span v-html="item.icon"></span>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <div class="navbar-actions" style="display: flex; align-items: center; gap: 12px;">
        <router-link to="/profile" class="nav-link" style="gap: 10px;">
          <img v-if="profilePhoto" class="avatar sm profile-photo" :src="profilePhoto" alt="Foto profil" />
          <span v-else class="avatar sm" aria-hidden="true">{{ userInitial }}</span>
          <span class="navbar-user-meta" style="display:none; line-height: 1.15;">
            <strong style="font-size:13px; color:var(--text);">{{ authStore.user?.name || '-' }}</strong><br>
            <small style="font-size:11px; color:var(--text-soft);">{{ authStore.user?.role === 'PERAWAT' ? 'Perawat' : 'Pasien' }}</small>
          </span>
        </router-link>
        <button class="btn ghost sm" @click="handleLogout">Logout</button>
        <button class="navbar-toggler" @click="drawerOpen = true">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Drawer -->
  <div class="mobile-menu-backdrop" :class="{ 'is-hidden': !drawerOpen }" @click="drawerOpen = false"></div>
  <aside class="mobile-drawer" :class="{ open: drawerOpen }">
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div class="navbar-brand">
        <span class="navbar-brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo NGT-Safe CO2" />
        </span>
        <span>
          <span class="navbar-brand-title">NGT-Safe CO2</span>
          <span class="navbar-brand-subtitle">{{ authStore.user?.role === 'PERAWAT' ? 'Perawat' : 'Pasien' }}</span>
        </span>
      </div>
      <button class="mobile-drawer-close" @click="drawerOpen = false">&times;</button>
    </div>
    <nav class="mobile-drawer-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.key" 
        :to="item.href" 
        class="nav-link" 
        active-class="active"
        @click="drawerOpen = false"
      >
        <span v-html="item.icon"></span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
    <div style="margin-top:auto; display:flex; align-items:center; gap:12px; padding:14px; border-radius:16px; background:var(--primary-mint);">
      <img v-if="profilePhoto" class="avatar sm profile-photo" :src="profilePhoto" alt="Foto profil" />
      <div v-else class="avatar sm">{{ userInitial }}</div>
      <div style="line-height:1.2;">
        <strong style="display:block; font-size:13px;">{{ authStore.user?.name }}</strong>
        <small style="color:var(--text-soft); font-size:11px;">{{ authStore.user?.email }}</small>
      </div>
    </div>
    <button class="btn ghost sm" @click="handleLogout" style="width:100%; justify-content:center;">Logout</button>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo-pkm-erfat.png'

const router = useRouter()
const authStore = useAuthStore()
const drawerOpen = ref(false)

const userInitial = computed(() => {
  const name = authStore.user?.name || 'U'
  return name.charAt(0).toUpperCase()
})

const profilePhoto = computed(() => authStore.user?.profile_photo || '')

const icons = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 12h-4l-3 8L9 4l-3 8H2"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.8L7.6 9.6a16 16 0 0 0 6.8 6.8l1.3-1.3a2 2 0 0 1 1.8-.6l2.8.4a2 2 0 0 1 1.7 2z"/></svg>',
  device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>'
}

const navItems = computed(() => {
  const items = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: icons.grid },
    { key: 'monitoring', label: 'Monitoring', href: '/monitoring', icon: icons.activity },
    { key: 'history', label: 'Riwayat', href: '/history', icon: icons.clock },
    { key: 'notifications', label: 'Notifikasi', href: '/notifications', icon: icons.bell },
    { key: 'contact', label: 'Contact', href: '/contact', icon: icons.phone },
  ]
  if (authStore.isPatient) {
    items.push({ key: 'connect_device', label: 'Connect Device', href: '/connect-device', icon: icons.device })
  }
  if (authStore.isNurse) {
    items.push({ key: 'admin_devices', label: 'Token & Device', href: '/admin/devices', icon: icons.device })
  }
  return items
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-navbar {
  /* Scoped styles overrides or additions */
}
</style>
