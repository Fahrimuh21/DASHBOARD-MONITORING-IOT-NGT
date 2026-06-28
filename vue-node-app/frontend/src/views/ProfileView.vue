<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Profil Pengguna</h2>
        <p style="color:var(--text-soft); font-size:13px; margin:4px 0 0;">Kelola informasi akun Anda.</p>
      </div>
    </header>

    <div v-if="loading && !form.name" class="spinner"></div>

    <div v-else class="dashboard-grid">
      <div class="card profile-summary-card" style="align-self: start;">
        <div class="profile-summary-banner">
          <img v-if="profilePhoto" class="avatar profile-summary-avatar profile-photo" :src="profilePhoto" alt="Foto profil" />
          <div v-else class="avatar profile-summary-avatar">{{ initial }}</div>
        </div>
        <div class="profile-summary-body">
          <h2>{{ form.name }}</h2>
          <p>{{ authStore.user?.email }}</p>
          <span class="badge profile-role-pill">{{ roleLabel }}</span>
        </div>
      </div>

      <div class="card">
        <div v-if="errorMsg" class="alert-box error" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="alert-box success" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
          {{ successMsg }}
        </div>

        <!-- READ-ONLY VIEW -->
        <template v-if="!editing">
          <div class="form-section-head">
            <span class="form-section-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
            </span>
            <h3>Informasi Pribadi</h3>
          </div>

          <div class="profile-info-list">
            <div class="profile-info-row">
              <small>Nama Lengkap</small>
              <strong>{{ form.name || '-' }}</strong>
            </div>
            <div class="profile-info-row">
              <small>No. Telepon / WA</small>
              <strong>{{ form.phone || '-' }}</strong>
            </div>
            <div class="profile-info-row">
              <small>Kamar / Lokasi</small>
              <strong>{{ form.alamat || '-' }}</strong>
            </div>
          </div>

          <button type="button" class="btn primary" @click="startEdit" style="width:100%; margin-top:14px;">
            <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Edit Profil
          </button>
        </template>

        <!-- EDIT FORM -->
        <form v-else @submit.prevent="handleUpdate" class="form">
          <div class="form-section-head">
            <span class="form-section-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
            </span>
            <h3>Edit Informasi Pribadi</h3>
          </div>

          <div class="profile-photo-editor">
            <img v-if="profilePhoto" class="avatar profile-photo" :src="profilePhoto" alt="Preview foto profil" />
            <div v-else class="avatar">{{ initial }}</div>
            <div class="profile-photo-actions">
              <div class="profile-photo-buttons">
                <label class="btn ghost sm">
                  Pilih Foto
                  <input class="is-hidden" type="file" accept="image/png,image/jpeg,image/webp" @change="handlePhotoChange" />
                </label>
                <button v-if="profilePhoto" type="button" class="btn warn sm" @click="removePhoto">Hapus</button>
              </div>
              <small class="muted">PNG, JPG, atau WebP. Maksimal 1 MB.</small>
            </div>
          </div>

          <div>
            <label class="field-label">Nama Lengkap
              <input type="text" v-model="form.name" required />
            </label>
          </div>

          <div>
            <label class="field-label">No. Telepon / WA
              <input type="text" v-model="form.phone" required />
            </label>
          </div>

          <div>
            <label class="field-label">Kamar / Lokasi
              <textarea v-model="form.alamat" rows="2"></textarea>
            </label>
          </div>

          <div class="form-section-head" style="margin-top:10px;">
            <span class="form-section-icon password">
              <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            </span>
            <h3>Ubah Password <span class="form-section-optional">(Opsional)</span></h3>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <label class="field-label">Password Baru
              <input type="password" v-model="form.password" minlength="6" placeholder="Biarkan kosong jika tidak diubah" />
            </label>
            <label class="field-label">Ulangi Password
              <input type="password" v-model="form.confirm_password" minlength="6" />
            </label>
          </div>

          <div style="display:flex; gap:10px; margin-top:10px;">
            <button type="button" class="btn ghost" @click="cancelEdit" :disabled="loading" style="flex:1;">Batal</button>
            <button type="submit" class="btn primary" :disabled="loading" style="flex:1;">
              {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <BottomNavbar />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const authStore = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const editing = ref(false)

const form = reactive({
  name: '',
  phone: '',
  alamat: '',
  profile_photo: '',
  password: '',
  confirm_password: ''
})

const originalProfile = reactive({ name: '', phone: '', alamat: '', profile_photo: '' })

const profilePhoto = computed(() => form.profile_photo || authStore.user?.profile_photo || '')

const initial = computed(() => {
  return (form.name || 'U').charAt(0).toUpperCase()
})

const roleLabel = computed(() => {
  const role = authStore.user?.role
  if (role === 'PERAWAT') return 'Perawat'
  if (role === 'PASIEN') return 'Pasien'
  return role || '-'
})

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/profile')
    if (data.success) {
      form.name = data.data.user.name
      form.phone = data.data.user.phone
      form.alamat = data.data.user.alamat || ''
      form.profile_photo = data.data.user.profile_photo || ''
      Object.assign(originalProfile, {
        name: form.name,
        phone: form.phone,
        alamat: form.alamat,
        profile_photo: form.profile_photo
      })
    }
  } catch (err) {
    errorMsg.value = 'Gagal memuat data profil.'
  } finally {
    loading.value = false
  }
})

const startEdit = () => {
  errorMsg.value = ''
  successMsg.value = ''
  editing.value = true
}

const cancelEdit = () => {
  form.name = originalProfile.name
  form.phone = originalProfile.phone
  form.alamat = originalProfile.alamat
  form.profile_photo = originalProfile.profile_photo
  form.password = ''
  form.confirm_password = ''
  errorMsg.value = ''
  successMsg.value = ''
  editing.value = false
}

const handleUpdate = async () => {
  if (form.password && form.password !== form.confirm_password) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    successMsg.value = ''
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const { data } = await api.put('/profile', form)
    if (data.success) {
      successMsg.value = 'Profil berhasil diperbarui.'
      form.password = ''
      form.confirm_password = ''
      Object.assign(originalProfile, {
        name: form.name,
        phone: form.phone,
        alamat: form.alamat,
        profile_photo: form.profile_photo
      })
      editing.value = false
      authStore.checkAuth() // refresh name in session
    } else {
      errorMsg.value = data.message
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memperbarui profil.'
  } finally {
    loading.value = false
  }
}

const handlePhotoChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMsg.value = 'File harus berupa gambar.'
    event.target.value = ''
    return
  }

  if (file.size > 1024 * 1024) {
    errorMsg.value = 'Ukuran foto maksimal 1 MB.'
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.profile_photo = reader.result
    errorMsg.value = ''
  }
  reader.onerror = () => {
    errorMsg.value = 'Gagal membaca foto profil.'
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  form.profile_photo = ''
}
</script>
