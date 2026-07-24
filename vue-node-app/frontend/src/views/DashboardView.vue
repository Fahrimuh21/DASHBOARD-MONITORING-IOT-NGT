<template>
  <div class="dashboard-page app-shell">
    <AppNavbar />

    <!-- HERO SECTION -->
    <header class="hero-card">
      <div class="hero-content">
        <h1 class="hero-title">Posisi selang makan (NGT)<br>terpantau, Anda tetap tenang.</h1>
        <p class="hero-description">
          Kami memantau kadar CO₂ secara otomatis untuk membantu memastikan selang tetap di posisi yang tepat. Tenang, Anda akan langsung mendapat notifikasi jika ada hal yang perlu diperhatikan.
        </p>
      </div>
      <div class="hero-actions">
        <button class="btn-primary" @click="scrollToDashboard">Lihat Pemantauan</button>
        <router-link to="/history" class="btn-secondary">Lihat Riwayat Data</router-link>
      </div>
    </header>

    <div v-if="dashboardStore.error" class="alert-box error" style="margin-top: 20px;">
      {{ dashboardStore.error }}
    </div>

    <!-- NURSE VIEW: Grid of Patients -->
    <div v-if="authStore.isNurse" id="dashboard-content" style="padding-top: 20px;">
      <div class="section-head">
        <h2>Pasien yang Anda Pantau</h2>
        <button class="btn sm ghost" @click="dashboardStore.fetchLatestData">Perbarui Data</button>
      </div>
      <div v-if="dashboardStore.loading && dashboardStore.latestDevices.length === 0" class="spinner"></div>
      <div v-else-if="dashboardStore.latestDevices.length === 0" class="empty">Belum ada pasien yang terhubung saat ini.</div>
      <div v-else class="nurse-patient-grid">
        <router-link
          v-for="device in dashboardStore.latestDevices"
          :key="device.device_id"
          :to="`/history?device_id=${device.device_id}`"
          class="nurse-patient-card"
        >
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div class="nurse-patient-main">
              <div class="avatar sm" style="background:var(--primary-soft); color:var(--primary-dark);">
                {{ (device.patient_name || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="nurse-patient-meta">
                <strong style="color:var(--text); font-size:13px;">{{ device.patient_name || 'Nama pasien belum diisi' }}</strong>
                <span>{{ device.device_name }} &middot; Kamar: {{ device.location || '-' }}</span>
              </div>
            </div>
            <span class="status-dot" :class="getRiskClass(device.risk_level, device.connection_status)"></span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:7px;">
            <div>
              <small style="display:block; color:var(--text-soft); font-size:11px; margin-bottom:2px;">Kadar CO₂ Terbaca</small>
              <div class="nurse-patient-reading">
                {{ formatPpm(device.co2_ppm) }} <small style="font-size:11px; color:var(--text-soft);">ppm</small>
              </div>
            </div>
            <div style="text-align:right;">
              <span class="badge" :class="getRiskClass(device.risk_level, device.connection_status)" style="font-size:10px; padding:4px 8px;">
                {{ getRiskLabel(device.risk_level, device.connection_status) }}
              </span>
              <small style="display:block; color:var(--text-soft); font-size:10px; margin-top:5px;">
                {{ formatTime(device.reading_at) }}
              </small>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- PATIENT / SINGLE DEVICE VIEW (Modern Layout) -->
    <div v-else-if="authStore.isPatient" id="dashboard-content" style="padding-top: 20px;">
      <div v-if="dashboardStore.loading && dashboardStore.latestDevices.length === 0" class="spinner"></div>
      
      <div v-else-if="dashboardStore.latestDevices.length === 0" class="empty">
        <div style="margin-bottom:16px;">Anda belum terhubung ke perangkat NGT mana pun. Yuk, hubungkan perangkat Anda agar kami bisa mulai memantau.</div>
        <router-link to="/connect-device" class="btn primary">Hubungkan Perangkat</router-link>
      </div>

      <div v-else v-for="device in dashboardStore.latestDevices" :key="device.device_id" style="margin-bottom: 40px;">
        
        <!-- Top Metrics Row -->
        <div class="metric-grid">
          <StatCard
            title="CO₂ Saat Ini"
            :value="formatPpm(device.co2_ppm)"
            unit="ppm"
            type="co2"
          >
            <template #icon><svg viewBox="0 0 24 24" class="icon-co2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></template>
          </StatCard>

          <BaselineCard
            :baselinePpm="device.baseline_ppm"
            :currentPpm="device.co2_ppm"
            :deviationPpm="device.deviation_ppm"
            :deviationPercent="device.deviation_percent"
            :baselineStatus="device.baseline_status"
            :baselineValid="device.baseline_valid"
            :baselineState="device.baseline_state"
          />

          <StatCard
            title="Status Perangkat"
            :value="device.connection_status === 'ONLINE' ? 'Online' : 'Offline'"
            unit=""
            type="device"
          >
            <template #icon><svg viewBox="0 0 24 24" class="icon-device"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg></template>
          </StatCard>

          <StatCard
            title="Notifikasi Hari Ini"
            :value="alertsStore.todayCount"
            unit="baru"
            type="alert"
          >
            <template #icon><svg viewBox="0 0 24 24" class="icon-alert"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></template>
          </StatCard>
        </div>

        <!-- Main Dashboard Grid -->
        <div class="dashboard-grid">
          
          <!-- Left Col: Realtime CO2 -->
          <div class="card chart-card">
            <div class="section-head">
              <h2>Pembacaan CO₂ Real-time</h2>
              <StatusBadge :co2="device.co2_ppm" :isOnline="device.connection_status === 'ONLINE'" />
            </div>

            <div class="co2-chart-layout">
              <div class="co2-donut-wrap">
                <Co2Donut
                  :ppm="getDonutPpm(device)"
                  :percent="device.co2_percent"
                  :riskClass="getDonutRiskClass(device.risk_level)"
                  :isOnline="device.connection_status === 'ONLINE'"
                />
              </div>

              <div class="co2-info-box">
                <div class="co2-info-item">
                  <strong>Sebelumnya</strong>
                  <span>{{ formatPpm(device.previous_co2_ppm) }} ppm</span>
                </div>
                <div class="co2-info-item">
                  <strong>Perubahan</strong>
                  <span>{{ device.delta_co2_ppm > 0 ? '+' : '' }}{{ device.delta_co2_ppm || 0 }} ppm</span>
                </div>
                <div class="co2-info-item">
                  <strong>Tren</strong>
                  <span>{{ device.co2_trend || '-' }}</span>
                </div>
                <div class="co2-info-item">
                  <strong>Status NGT</strong>
                  <span>{{ formatNgtStatus(device.ngt_status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Col: Alerts -->
          <div class="card alerts-card">
            <div class="section-head">
              <h2>Notifikasi Terbaru</h2>
              <span class="badge">{{ alertsStore.alerts.length }}</span>
            </div>

            <div class="content-stack">
              <div v-if="alertsStore.loading && alertsStore.alerts.length === 0" class="spinner sm"></div>
              <div v-else-if="alertsStore.alerts.length === 0" class="empty sm">Belum ada notifikasi. Semua kondisi aman!</div>
              
              <template v-else>
                <div 
                  v-for="alert in alertsStore.alerts.slice(0, 4)" 
                  :key="alert.id" 
                  class="alert-row"
                  :class="getAlertRiskClass(alert.level)"
                  @click="handleAlertClick(alert)"
                >
                  <div class="alert-icon" :class="getAlertRiskClass(alert.level)">
                    <span v-if="alert.level === 'HIGH'">!</span>
                    <span v-else-if="alert.level === 'MEDIUM'">!</span>
                    <span v-else>OK</span>
                  </div>
                  <div class="alert-content">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                      <strong>{{ alert.level === 'HIGH' ? 'Bahaya' : (alert.level === 'MEDIUM' ? 'Waspada' : 'Aman') }}</strong>
                      <small style="color:var(--text-soft)">{{ formatTimeOnly(alert.created_at) }}</small>
                    </div>
                    <span style="font-size:12px; color:var(--text-soft)">{{ alert.title }}</span>
                    <span v-if="alert.message" style="display:block; font-size:12px; color:var(--text); margin-top:2px;">{{ alert.message }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
          
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
import Co2Donut from '@/components/Co2Donut.vue'
import StatCard from '@/components/StatCard.vue'
import BaselineCard from '@/components/BaselineCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useAlertsStore } from '@/stores/alerts'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const alertsStore = useAlertsStore()

onMounted(() => {
  dashboardStore.startPolling(5000)
  alertsStore.fetchAlerts()
  alertsStore.fetchUnreadCount()
  alertsStore.fetchTodayCount()
})

onUnmounted(() => {
  dashboardStore.stopPolling()
})

const scrollToDashboard = () => {
  const el = document.getElementById('dashboard-content')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const getRiskClass = (riskLevel, connectionStatus) => {
  if (connectionStatus === 'OFFLINE') return 'risk-offline'
  if (riskLevel === 'HIGH') return 'risk-high'
  if (riskLevel === 'MEDIUM') return 'risk-medium'
  return 'risk-low'
}

const getDonutRiskClass = (riskLevel) => {
  if (riskLevel === 'HIGH') return 'risk-high'
  if (riskLevel === 'MEDIUM') return 'risk-medium'
  return 'risk-low'
}

const isBaselineValid = (device) => {
  return device?.baseline_valid === true || device?.baseline_valid === 1 || device?.baseline_valid === '1'
}

const getDonutPpm = (device) => {
  if (!device || device.connection_status !== 'ONLINE' || !isBaselineValid(device)) return 0
  return device.deviation_ppm ?? 0
}

const getRiskLabel = (riskLevel, connectionStatus) => {
  if (connectionStatus === 'OFFLINE') return 'Offline'
  if (riskLevel === 'HIGH') return 'Bahaya'
  if (riskLevel === 'MEDIUM') return 'Waspada'
  if (riskLevel === 'LOW') return 'Aman'
  return 'Belum Diketahui'
}

const getAlertRiskClass = (level) => {
  if (level === 'HIGH') return 'danger'
  if (level === 'MEDIUM') return 'warning'
  return 'safe'
}

const formatPpm = (val) => {
  if (val === null || val === undefined) return '-'
  return Number(val).toLocaleString('id-ID', { maximumFractionDigits: 0 })
}

const formatTime = (val) => {
  if (!val) return '-'
  const date = new Date(val)
  if (isNaN(date)) return val
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatTimeOnly = (val) => {
  if (!val) return '-'
  const date = new Date(val)
  if (isNaN(date)) return val
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatNgtStatus = (status) => {
  if (!status) return 'Aman'
  if (status === 'NORMAL') return 'Aman'
  if (status === 'DANGER') return 'Bahaya'
  if (status === 'TERINDIKASI_NON_RESPIRATORIK') return 'Aman'
  if (status === 'PERLU_VERIFIKASI') return 'Waspada'
  if (status === 'RISIKO_MALPOSISI_RESPIRATORIK') return 'Bahaya'
  return status.replace(/_/g, ' ')
}

const handleAlertClick = (alert) => {
  if (!alert.is_read) {
    alertsStore.markAsRead(alert.id)
  }
}
</script>
