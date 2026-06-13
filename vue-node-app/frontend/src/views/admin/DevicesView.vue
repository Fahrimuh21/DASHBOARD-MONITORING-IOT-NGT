<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Manajemen Perangkat (Admin)</h2>
        <p style="color:var(--text-soft); font-size:14px; margin:4px 0 0;">Kelola daftar token dan perangkat NGT untuk pasien.</p>
      </div>
      <router-link to="/admin/device/create" class="btn primary">Tambah Perangkat</router-link>
    </header>

    <div v-if="loading" class="spinner"></div>

    <div v-else-if="devices.length === 0" class="empty">
      Belum ada perangkat terdaftar.
    </div>

    <div v-else class="card wide-table" style="padding:0; overflow:hidden;">
      <table>
        <thead>
          <tr>
            <th>Nama Perangkat</th>
            <th>Kode</th>
            <th>Token Pasien</th>
            <th>Lokasi</th>
            <th>Pasien Terhubung</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in devices" :key="d.id" :style="d.status !== 'active' ? 'opacity:0.6;' : ''">
            <td><strong>{{ d.device_name }}</strong></td>
            <td style="font-family:monospace;">{{ d.device_code }}</td>
            <td>
              <div style="display:flex; align-items:center; gap:6px;">
                <code style="background:var(--primary-mint); padding:2px 6px; border-radius:4px; font-size:12px;">{{ d.device_token }}</code>
              </div>
            </td>
            <td>{{ d.location || '-' }}</td>
            <td>
              <div v-if="d.patient_name">
                <strong style="font-size:13px; color:var(--primary-dark);">{{ d.patient_name }}</strong>
                <button class="btn ghost sm" @click="disconnectPatient(d.id)" style="padding:2px 6px; font-size:10px; margin-left:6px; height:auto;">Lepas</button>
              </div>
              <span v-else style="color:var(--text-soft); font-style:italic;">Belum terhubung</span>
            </td>
            <td>
              <span class="badge" :class="d.status === 'active' ? 'risk-low' : 'risk-offline'">
                {{ d.status === 'active' ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <router-link :to="`/admin/device/${d.id}/edit`" class="btn ghost sm">Edit</router-link>
                <button class="btn sm" :class="d.status === 'active' ? 'warn' : 'primary'" @click="toggleStatus(d.id)">
                  {{ d.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import api from '@/api'

const devices = ref([])
const loading = ref(false)

const fetchDevices = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/devices')
    if (data.success) {
      devices.value = data.data.devices
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDevices()
})

const toggleStatus = async (id) => {
  try {
    const { data } = await api.put(`/devices/${id}/toggle`)
    if (data.success) {
      fetchDevices()
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengubah status perangkat.')
  }
}

const disconnectPatient = async (deviceId) => {
  if (!confirm('Lepaskan pasien dari perangkat ini?')) return
  try {
    // Admin override endpoint is not created, but we can update device user_id to null via edit endpoint.
    // Assuming edit endpoint allows `user_id: ''`
    const { data } = await api.get(`/devices/${deviceId}`)
    if (data.success) {
      const dev = data.data.device
      await api.put(`/devices/${deviceId}`, {
        device_name: dev.device_name,
        device_code: dev.device_code,
        device_token: dev.device_token,
        location: dev.location,
        status: dev.status,
        user_id: '' // disconnect
      })
      fetchDevices()
    }
  } catch (err) {
    alert('Gagal melepas pasien.')
  }
}
</script>
