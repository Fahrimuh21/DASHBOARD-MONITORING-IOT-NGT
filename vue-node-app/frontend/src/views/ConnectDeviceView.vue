<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Hubungkan Perangkat NGT</h2>
        <p style="color:var(--text-soft); font-size:14px; margin:4px 0 0;">Masukkan token perangkat yang diberikan oleh perawat.</p>
      </div>
    </header>

    <div class="dashboard-grid-clean">
      <div class="card" style="max-width: 500px;">
        
        <div v-if="errorMsg" class="alert-box error" style="padding:10px; font-size:13px; margin:0 0 14px;">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="alert-box success" style="padding:10px; font-size:13px; margin:0 0 14px;">
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
                style="font-family:monospace; font-size:18px; letter-spacing:2px;" 
              />
            </label>
            <small style="color:var(--text-soft); font-size:12px; margin-top:6px; display:block;">
              Minta token perangkat ke perawat yang bertugas.
            </small>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:10px;">
            {{ loading ? 'Menghubungkan...' : 'Hubungkan Perangkat' }}
          </button>
        </form>

        <hr style="border:0; border-top:1px solid var(--border); margin:24px 0;" />

        <h3 style="margin:0 0 10px; font-size:14px;">Perangkat Terhubung Saat Ini</h3>
        <div v-if="loadingMyDevice" class="spinner"></div>
        <div v-else-if="!myDevice" class="empty" style="padding:20px 10px;">
          Belum ada perangkat terhubung.
        </div>
        <div v-else class="card-row" style="background:var(--primary-mint); padding:14px; border-radius:12px; border:1px solid rgba(16,185,129,.25);">
          <div>
            <strong>{{ myDevice.device_name }}</strong>
            <small style="display:block; color:var(--primary-dark);">{{ myDevice.device_code }}</small>
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
