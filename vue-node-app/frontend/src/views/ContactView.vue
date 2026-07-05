<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Kontak {{ roleLabel }}</h2>
        <p style="color:var(--text-soft); font-size:13px; margin:4px 0 0;">Daftar kontak yang dapat dihubungi.</p>
      </div>
    </header>

    <div v-if="loading" class="spinner"></div>
    
    <div v-else-if="contacts.length === 0" class="empty">
      Belum ada data kontak.
    </div>

    <div v-else class="contact-grid">
      <div v-for="contact in contacts" :key="contact.id" class="card contact-card-modern">
        <div class="contact-card-banner">
          <img v-if="contact.profile_photo" class="contact-avatar contact-card-avatar profile-photo" :src="contact.profile_photo" :alt="`Foto profil ${contact.name}`" />
          <div v-else class="contact-avatar contact-card-avatar">{{ contact.name?.charAt(0).toUpperCase() || 'P' }}</div>
        </div>

        <div class="contact-card-body">
          <h2>{{ contact.name }}</h2>
          <span class="pill contact-role-pill">{{ contact.position || 'Perawat' }}</span>

          <div class="contact-detail-list">
            <div class="contact-detail-row">
              <span class="contact-detail-icon">
                <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.8L7.6 9.6a16 16 0 0 0 6.8 6.8l1.3-1.3a2 2 0 0 1 1.8-.6l2.8.4a2 2 0 0 1 1.7 2z"/></svg>
              </span>
              <div>
                <small>Telepon/WA</small>
                <a :href="contact.wa_link" target="_blank">{{ contact.phone || '-' }}</a>
              </div>
            </div>
            <div class="contact-detail-row">
              <span class="contact-detail-icon location">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div>
                <small>Kamar/Lokasi</small>
                <strong>{{ contact.alamat || '-' }}</strong>
              </div>
            </div>
          </div>

          <a :href="contact.wa_link" target="_blank" class="btn-whatsapp">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.4 1.27 4.83L2 22l5.34-1.32a9.9 9.9 0 0 0 4.7 1.18h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm0 18.06h-.01a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.13.78.84-3.06-.2-.32a8.16 8.16 0 0 1-1.26-4.35c0-4.53 3.7-8.23 8.27-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.42 5.83c0 4.53-3.71 8.26-8.26 8.26zm4.52-6.17c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.96-.14.16-.29.18-.54.06-1.46-.73-2.42-1.3-3.38-2.95-.26-.44.26-.41.74-1.36.08-.16.04-.3-.04-.42-.08-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.3-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.16 1.76 2.69 4.27 3.66 2.13.83 2.56.69 3.02.65.46-.04 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
            Chat WhatsApp
          </a>
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
