<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Live Monitoring</h2>
        <p style="color:var(--text-soft); font-size:14px; margin:4px 0 0;">Pemantauan sensor realtime dengan interval 5 detik.</p>
      </div>
      <button class="btn sm ghost" @click="dashboardStore.fetchLatestData" :disabled="dashboardStore.loading">
        Segarkan
      </button>
    </header>

    <div v-if="dashboardStore.loading && dashboardStore.latestDevices.length === 0" class="spinner"></div>
    
    <div v-else-if="dashboardStore.latestDevices.length === 0" class="empty">
      Tidak ada device yang dapat dimonitor.
    </div>

    <div v-else class="content-stack">
      <div v-for="device in dashboardStore.latestDevices" :key="device.device_id" class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="margin:0; font-size:16px;">{{ device.device_name }}</h3>
            <small style="color:var(--text-soft);">{{ device.patient_name || 'Tanpa Pasien' }} &middot; Kamar: {{ device.location || '-' }}</small>
          </div>
          <span class="badge" :class="device.connection_status === 'ONLINE' ? 'risk-low' : 'risk-offline'">
            {{ device.connection_status }}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px;">
          <div style="padding:14px; background:rgba(255,255,255,.5); border:1px solid var(--border); border-radius:12px;">
            <small style="display:block; color:var(--text-soft); font-size:11px; margin-bottom:4px;">CO2 (PPM)</small>
            <strong style="font-size:24px; font-family:monospace;">{{ device.co2_ppm ?? '-' }}</strong>
          </div>
          <div style="padding:14px; background:rgba(255,255,255,.5); border:1px solid var(--border); border-radius:12px;">
            <small style="display:block; color:var(--text-soft); font-size:11px; margin-bottom:4px;">Persentase CO2</small>
            <strong style="font-size:24px; font-family:monospace;">{{ device.co2_percent !== null ? Number(device.co2_percent).toFixed(2) + '%' : '-' }}</strong>
          </div>
          <div style="padding:14px; background:rgba(255,255,255,.5); border:1px solid var(--border); border-radius:12px;">
            <small style="display:block; color:var(--text-soft); font-size:11px; margin-bottom:4px;">Status NGT</small>
            <strong style="font-size:14px;" :class="getRiskClass(device.risk_level, device.connection_status)">
              {{ device.ngt_status ? device.ngt_status.replace(/_/g, ' ') : '-' }}
            </strong>
          </div>
        </div>
        
        <div v-if="device.message" style="margin-top:12px; padding:12px 14px; background:var(--info-bg); border-radius:12px; font-size:13px; color:#0369a1;">
          <strong>Pesan Klinis:</strong> {{ device.message }}
        </div>
      </div>
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.startPolling(5000)
})

onUnmounted(() => {
  dashboardStore.stopPolling()
})

const getRiskClass = (riskLevel, connectionStatus) => {
  if (connectionStatus === 'OFFLINE') return 'muted'
  if (riskLevel === 'HIGH') return 'risk-high'
  if (riskLevel === 'MEDIUM') return 'risk-medium'
  return 'risk-low'
}
</script>
