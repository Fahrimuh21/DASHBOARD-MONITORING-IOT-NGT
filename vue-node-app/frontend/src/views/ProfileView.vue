<template>
  <div class="app-shell">
    <AppNavbar />

    <header class="section-head" style="margin-bottom: 24px;">
      <div>
        <h2>Profil Pengguna</h2>
        <p style="color:var(--text-soft); font-size:14px; margin:4px 0 0;">Kelola informasi akun Anda.</p>
      </div>
    </header>

    <div v-if="loading && !form.name" class="spinner"></div>

    <div v-else class="dashboard-grid">
      <div class="card" style="align-self: start;">
        <div class="profile-card">
          <img v-if="profilePhoto" class="avatar profile-photo" :src="profilePhoto" alt="Foto profil" />
          <div v-else class="avatar">{{ initial }}</div>
          <h2>{{ form.name }}</h2>
          <p>{{ authStore.user?.email }}</p>
          <span class="badge" style="margin-top:10px;">{{ authStore.user?.role }}</span>
        </div>
      </div>

      <div class="card">
        <div v-if="errorMsg" class="alert-box error" style="padding:10px; font-size:13px; margin:0 0 14px;">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="alert-box success" style="padding:10px; font-size:13px; margin:0 0 14px;">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleUpdate" class="form">
          <h3 style="margin:0 0 10px; font-size:16px;">Informasi Pribadi</h3>

          <div class="profile-photo-editor">
            <img v-if="profilePhoto" class="avatar profile-photo" :src="profilePhoto" alt="Preview foto profil" />
            <div v-else class="avatar">{{ initial }}</div>
            <div class="profile-photo-actions">
              <label class="btn ghost sm">
                Pilih Foto
                <input class="is-hidden" type="file" accept="image/png,image/jpeg,image/webp" @change="handlePhotoChange" />
              </label>
              <button v-if="profilePhoto" type="button" class="btn warn sm" @click="removePhoto">Hapus</button>
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

          <h3 style="margin:20px 0 10px; font-size:16px;">Ubah Password <span style="font-size:12px; font-weight:normal; color:var(--text-soft);">(Opsional)</span></h3>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <label class="field-label">Password Baru
              <input type="password" v-model="form.password" minlength="6" placeholder="Biarkan kosong jika tidak diubah" />
            </label>
            <label class="field-label">Ulangi Password
              <input type="password" v-model="form.confirm_password" minlength="6" />
            </label>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:10px;">
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
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

const form = reactive({
  name: '',
  phone: '',
  alamat: '',
  profile_photo: '',
  password: '',
  confirm_password: ''
})

const profilePhoto = computed(() => form.profile_photo || authStore.user?.profile_photo || '')

const initial = computed(() => {
  return (form.name || 'U').charAt(0).toUpperCase()
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
    }
  } catch (err) {
    errorMsg.value = 'Gagal memuat data profil.'
  } finally {
    loading.value = false
  }
})

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
