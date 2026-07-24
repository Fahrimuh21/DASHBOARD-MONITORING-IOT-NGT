<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 20px;">
      <div>
        <h2>Riwayat Pembacaan</h2>
        <p style="color:var(--text-soft); font-size:13px; margin:4px 0 0;">Log data historis sensor CO2.</p>
      </div>
    </header>

    <div class="card" style="margin-bottom: 20px;">
      <form @submit.prevent="fetchHistory" class="inline-form">
        <select v-if="authStore.isNurse" v-model="filters.device_id">
          <option value="">Semua Device</option>
          <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.device_name }}</option>
        </select>
        <select v-model="filters.risk_level">
          <option value="">Semua Tingkat Risiko</option>
          <option value="LOW">Rendah (LOW)</option>
          <option value="MEDIUM">Menengah (MEDIUM)</option>
          <option value="HIGH">Tinggi (HIGH)</option>
        </select>
        <input type="date" v-model="filters.date" />
        <select v-model="filters.limit">
          <option value="30">30 Data Terakhir</option>
          <option value="50">50 Data Terakhir</option>
          <option value="100">100 Data Terakhir</option>
        </select>
        <button type="submit" class="btn ghost sm">Filter</button>
        <button type="button" class="btn ghost sm" @click="resetFilters">Reset</button>
      </form>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else-if="readings.length === 0" class="empty">
      Tidak ada data riwayat yang ditemukan.
    </div>

    <div v-else>
      <div class="card wide-table history-table-wrap" style="padding:0; overflow:hidden;">
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Device</th>
              <th>Pasien</th>
              <th>CO2 (ppm)</th>
              <th>Persentase</th>
              <th>Tren</th>
              <th>Status NGT</th>
              <th>Risiko</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in readings" :key="r.id">
              <td style="white-space:nowrap;">{{ formatTime(r.created_at) }}</td>
              <td><strong>{{ r.device_name }}</strong></td>
              <td>{{ r.patient_name || '-' }}</td>
              <td style="font-family:monospace;">{{ r.co2_ppm ?? '-' }}</td>
              <td style="font-family:monospace;">{{ r.co2_percent !== null ? Number(r.co2_percent).toFixed(2) + '%' : '-' }}</td>
              <td>
                <span class="pill" style="font-size:10px; padding:3px 8px;" :style="getTrendStyle(r.co2_trend)">
                  {{ trendLabel(r.co2_trend) }}
                </span>
              </td>
              <td>{{ formatNgtStatus(r.ngt_status) }}</td>
              <td><span class="pill" :class="`risk-${(r.risk_level || 'low').toLowerCase()}`" style="font-size:10px; padding:3px 8px;">{{ riskLabel(r.risk_level) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="history-list">
        <div class="history-card" v-for="r in readings" :key="r.id">
          <div class="history-card-head">
            <span class="history-card-time">{{ formatTime(r.created_at) }}</span>
            <span class="pill" :class="`risk-${(r.risk_level || 'low').toLowerCase()}`" style="font-size:10px; padding:3px 8px;">{{ riskLabel(r.risk_level) }}</span>
          </div>
          <div class="history-card-main">
            <div class="history-card-co2"><strong>{{ r.co2_ppm ?? '-' }}</strong><small>ppm</small></div>
            <div class="history-card-percent">{{ r.co2_percent !== null ? Number(r.co2_percent).toFixed(2) + '%' : '-' }}</div>
          </div>
          <div class="history-card-meta">
            <strong>{{ r.device_name }}</strong>
            <span v-if="r.patient_name">&middot; {{ r.patient_name }}</span>
          </div>
          <div class="history-card-foot">
            <span class="pill" style="font-size:10px; padding:3px 8px;" :style="getTrendStyle(r.co2_trend)">{{ trendLabel(r.co2_trend) }}</span>
            <span class="history-card-status">{{ formatNgtStatus(r.ngt_status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const readings = ref([])
const devices = ref([])
const loading = ref(false)

const filters = reactive({
  device_id: '',
  risk_level: '',
  date: '',
  limit: '30'
})

const fetchDevices = async () => {
  if (!authStore.isNurse) return
  try {
    const { data } = await api.get('/devices')
    if (data.success) {
      devices.value = data.data.devices
    }
  } catch (err) {
    console.error(err)
  }
}

const fetchHistory = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.device_id) params.append('device_id', filters.device_id)
    if (filters.risk_level) params.append('risk_level', filters.risk_level)
    if (filters.date) params.append('date', filters.date)
    if (filters.limit) params.append('limit', filters.limit)

    const { data } = await api.get(`/readings?${params.toString()}`)
    if (data.success) {
      readings.value = data.data.readings
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.device_id = ''
  filters.risk_level = ''
  filters.date = ''
  filters.limit = '30'
  fetchHistory()
}

const formatTime = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const getTrendStyle = (trend) => {
  if (trend === 'NAIK') return 'background:#fef2f2; color:#b91c1c;'
  if (trend === 'TURUN') return 'background:#f0f9ff; color:#0369a1;'
  return 'background:#f1f5f9; color:#475569;'
}

const trendLabel = (trend) => {
  if (trend === 'NAIK') return 'Naik'
  if (trend === 'TURUN') return 'Turun'
  if (trend === 'STABIL') return 'Stabil'
  return trend || '-'
}

const riskLabel = (level) => {
  if (level === 'HIGH') return 'Bahaya'
  if (level === 'MEDIUM') return 'Waspada'
  if (level === 'LOW') return 'Aman'
  return '-'
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

onMounted(() => {
  fetchDevices()
  fetchHistory()
})
</script>
