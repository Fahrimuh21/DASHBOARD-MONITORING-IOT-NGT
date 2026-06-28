<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head form-page-head" style="margin-bottom: 24px;">
      <div>
        <h2>Hubungkan Perangkat NGT</h2>
        <p style="color:var(--text-soft); font-size:13px; margin:4px 0 0;">Masukkan token perangkat yang diberikan oleh perawat.</p>
      </div>
    </header>

    <div class="dashboard-grid-clean">
      <div class="card connect-device-card">

        <div class="connect-device-head">
          <span class="connect-device-icon">
            <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </span>
          <div>
            <h3>Hubungkan Perangkat Baru</h3>
            <p>Masukkan token unik yang diberikan perawat untuk menyambungkan sensor NGT Anda.</p>
          </div>
        </div>

        <div v-if="errorMsg" class="alert-box error" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="alert-box success" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleConnect" class="form">
          <div>
            <label class="field-label">Token Perangkat
              <input
                type="text"
                v-model="token"
                required
                placeholder="Contoh: NGT-12345"
                class="token-input"
              />
            </label>
            <small style="color:var(--text-soft); font-size:10px; margin-top:5px; display:block;">
              Minta token perangkat ke perawat yang bertugas.
            </small>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:8px;">
            {{ loading ? 'Menghubungkan...' : 'Hubungkan Perangkat' }}
          </button>
        </form>

        <div class="connect-divider"><span>Perangkat Terhubung Saat Ini</span></div>

        <div v-if="loadingMyDevice" class="spinner sm"></div>
        <div v-else-if="!myDevice" class="empty sm">
          Belum ada perangkat terhubung.
        </div>
        <div v-else class="connected-device-row">
          <div class="connected-device-info">
            <span class="connected-device-icon">
              <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
            </span>
            <div class="connected-device-meta">
              <strong>{{ myDevice.device_name }}</strong>
              <small>{{ myDevice.device_code }}</small>
            </div>
          </div>
          <button class="btn warn sm" @click="handleDisconnect(myDevice.id)" :disabled="loading">Lepas</button>
        </div>

      </div>
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import api from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref('')
const loading = ref(false)
const loadingMyDevice = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const myDevice = ref(null)

const fetchMyDevice = async () => {
  loadingMyDevice.value = true
  try {
    const { data } = await api.get('/devices')
    if (data.success && data.data.devices.length > 0) {
      myDevice.value = data.data.devices[0]
    } else {
      myDevice.value = null
    }
  } catch (err) {
    console.error(err)
  } finally {
    loadingMyDevice.value = false
  }
}

onMounted(() => {
  fetchMyDevice()
})

const handleConnect = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const { data } = await api.post('/devices/connect', { device_token: token.value })
    if (data.success) {
      successMsg.value = data.message
      token.value = ''
      await fetchMyDevice()
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      errorMsg.value = data.message
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal menghubungkan perangkat.'
  } finally {
    loading.value = false
  }
}

const handleDisconnect = async (deviceId) => {
  if (!confirm('Apakah Anda yakin ingin melepas perangkat ini?')) return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const { data } = await api.post('/devices/disconnect', { device_id: deviceId })
    if (data.success) {
      successMsg.value = data.message
      await fetchMyDevice()
    } else {
      errorMsg.value = data.message
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal melepas perangkat.'
  } finally {
    loading.value = false
  }
}
</script>
