<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Notifikasi & Alert</h2>
        <p style="color:var(--text-soft); font-size:13px; margin:4px 0 0;">Riwayat peringatan dan status NGT.</p>
      </div>
      <button 
        v-if="alertsStore.unreadCount > 0" 
        class="btn sm primary" 
        @click="alertsStore.markAllAsRead()"
        :disabled="alertsStore.loading"
      >
        Tandai Semua Dibaca
      </button>
    </header>

    <div v-if="alertsStore.loading && alertsStore.alerts.length === 0" class="spinner"></div>

    <div v-else-if="alertsStore.alerts.length === 0" class="empty">
      Tidak ada notifikasi saat ini.
    </div>

    <div v-else class="content-stack">
      <AlertRow 
        v-for="alert in alertsStore.alerts" 
        :key="alert.id" 
        :alert="alert"
        @click="handleAlertClick(alert)"
        style="cursor: pointer;"
        :style="alert.is_read ? 'opacity:0.7;' : 'border-left: 4px solid var(--primary);'"
      />
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import AlertRow from '@/components/AlertRow.vue'
import { useAlertsStore } from '@/stores/alerts'

const alertsStore = useAlertsStore()

onMounted(() => {
  alertsStore.fetchAlerts()
})

const handleAlertClick = (alert) => {
  if (!alert.is_read) {
    alertsStore.markAsRead(alert.id)
  }
}
</script>
