<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Tambah Perangkat Baru</h2>
        <p style="color:var(--text-soft); font-size:14px; margin:4px 0 0;">Daftarkan perangkat NGT/ESP32 ke dalam sistem.</p>
      </div>
      <router-link to="/admin/devices" class="btn ghost sm">Kembali</router-link>
    </header>

    <div class="dashboard-grid-clean">
      <div class="card" style="max-width: 600px;">
        <div v-if="errorMsg" class="alert-box error" style="padding:10px; font-size:13px; margin:0 0 14px;">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <div>
            <label class="field-label">Nama Perangkat
              <input type="text" v-model="form.device_name" required placeholder="Contoh: NGT Unit A" />
            </label>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <label class="field-label">Kode Perangkat (HW ID)
              <input type="text" v-model="form.device_code" required placeholder="Contoh: ESP32_001" style="font-family:monospace;" />
            </label>
            <label class="field-label">Token Akses
              <div style="display:flex; gap:8px;">
                <input type="text" v-model="form.device_token" required style="font-family:monospace;" />
                <button type="button" class="btn ghost" @click="generateToken" style="padding:0 12px;" title="Generate Token">↻</button>
              </div>
            </label>
          </div>

          <div>
            <label class="field-label">Lokasi / Kamar
              <input type="text" v-model="form.location" placeholder="Contoh: Ruang ICU 1" />
            </label>
          </div>

          <div>
            <label class="field-label">Pasien (Opsional)
              <select v-model="form.user_id">
                <option value="">-- Tidak Ada Pasien --</option>
                <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }} ({{ p.email }})</option>
              </select>
            </label>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:10px;">
            {{ loading ? 'Menyimpan...' : 'Simpan Perangkat' }}
          </button>
        </form>
      </div>
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import api from '@/api'

const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')
const patients = ref([])

const form = reactive({
  device_name: '',
  device_code: '',
  device_token: '',
  location: '',
  user_id: ''
})

const fetchPatients = async () => {
  try {
    const { data } = await api.get('/devices/patients')
    if (data.success) {
      patients.value = data.data.patients
    }
  } catch (err) {
    console.error(err)
  }
}

const generateToken = () => {
  form.device_token = 'NGT-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

onMounted(() => {
  fetchPatients()
  generateToken()
})

const handleSubmit = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const payload = { ...form }
    if (!payload.user_id) delete payload.user_id

    const { data } = await api.post('/devices', payload)
    if (data.success) {
      router.push('/admin/devices')
    } else {
      errorMsg.value = data.message
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal menyimpan perangkat.'
  } finally {
    loading.value = false
  }
}
</script>
