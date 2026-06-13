<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Kontak {{ roleLabel }}</h2>
        <p style="color:var(--text-soft); font-size:14px; margin:4px 0 0;">Daftar kontak yang dapat dihubungi.</p>
      </div>
    </header>

    <div v-if="loading" class="spinner"></div>
    
    <div v-else-if="contacts.length === 0" class="empty">
      Belum ada data kontak.
    </div>

    <div v-else class="contact-grid">
      <div v-for="contact in contacts" :key="contact.id" class="card" style="padding:24px;">
        <div class="contact-profile">
          <div class="contact-avatar">{{ contact.name?.charAt(0).toUpperCase() }}</div>
          <h2>{{ contact.name }}</h2>
          <p>{{ contact.position || 'Perawat' }}</p>
        </div>
        
        <div style="margin-top:20px; display:grid; gap:12px;">
          <div class="co2-info-item" style="padding:10px 14px;">
            <small style="color:var(--text-soft);">Telepon/WA</small>
            <a :href="contact.wa_link" target="_blank" style="font-weight:600; color:var(--primary-dark);">{{ contact.phone || '-' }}</a>
          </div>
          <div class="co2-info-item" style="padding:10px 14px;">
            <small style="color:var(--text-soft);">Kamar/Lokasi</small>
            <strong style="font-size:13px; color:var(--text);">{{ contact.alamat || '-' }}</strong>
          </div>
        </div>
        
        <a :href="contact.wa_link" target="_blank" class="btn primary" style="width:100%; margin-top:20px;">
          Chat WhatsApp
        </a>
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

const contacts = ref([])
const roleLabel = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/contacts')
    if (data.success) {
      contacts.value = data.data.contacts
      roleLabel.value = data.data.role_label
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>
