<!-- <template>
  <nav class="bottom-navbar" aria-label="Navigasi mobile">
    <router-link to="/dashboard" active-class="active" aria-label="Dashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span class="is-hidden">Home</span>
    </router-link>
    <router-link to="/monitoring" active-class="active" aria-label="Monitoring">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M22 12h-4l-3 8L9 4l-3 8H2"/>
      </svg>
      <span class="is-hidden">Live</span>
    </router-link>
    <router-link to="/history" active-class="active" aria-label="Riwayat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <span class="is-hidden">Log</span>
    </router-link>
    <router-link to="/notifications" active-class="active" aria-label="Notifikasi" style="position:relative;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>
      </svg>
      <span v-if="alertsStore.unreadCount > 0" 
            style="position:absolute; top:2px; right:6px; width:8px; height:8px; background:var(--danger); border-radius:50%;">
      </span>
      <span class="is-hidden">Alert</span>
    </router-link>
    <router-link to="/profile" active-class="active" aria-label="Profil">
      <img v-if="profilePhoto" class="bottom-profile-photo" :src="profilePhoto" alt="Foto profil" />
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <span class="is-hidden">Profil</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'

const alertsStore = useAlertsStore()
const authStore = useAuthStore()
const profilePhoto = computed(() => authStore.user?.profile_photo || '')
</script>

<style scoped>
.bottom-profile-photo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

@media (min-width: 769px) {
  .bottom-navbar {
    display: none !important;
  }
}
</style> -->

<!--
  BottomNavbar dimatikan untuk tampilan mobile.
  File ini sengaja dibuat kosong agar semua import <BottomNavbar />
  di setiap halaman tetap aman dan tidak menyebabkan conflict.
-->
<template></template>

<script setup>
// Tidak ada logic. Navigasi mobile sekarang memakai AppNavbar + drawer.
</script>
