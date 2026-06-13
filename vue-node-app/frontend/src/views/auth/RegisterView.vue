<template>
  <div class="login-page" style="padding: 40px 24px;">
    <div class="login-card" style="max-width: 500px;">
      <div class="login-brand">
        <div class="brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo NGT-Safe CO2" />
        </div>
        <div>
          <h2 class="app-name">NGT-Safe CO2</h2>
        </div>
      </div>
      
      <h1>Buat Akun</h1>
      <p class="login-subtitle">Daftarkan akun baru untuk menggunakan sistem.</p>

      <form @submit.prevent="handleRegister" class="form">
        <div class="role-switch">
          <label>
            <input type="radio" v-model="form.role" value="PASIEN" />
            <div class="role-tab">
              <span class="role-icon">🛏️</span>
              Pasien
            </div>
          </label>
          <label>
            <input type="radio" v-model="form.role" value="PERAWAT" />
            <div class="role-tab">
              <span class="role-icon">⚕️</span>
              Perawat
            </div>
          </label>
        </div>

        <div v-if="errorMsg" class="alert-box error" style="padding:10px; font-size:13px; margin:0;">
          {{ errorMsg }}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label class="field-label">Nama Lengkap
            <input type="text" v-model="form.name" required />
          </label>
          <label class="field-label">No. Telepon / WA
            <input type="text" v-model="form.phone" required />
          </label>
        </div>

        <div>
          <label class="field-label">Email
            <input type="email" v-model="form.email" required />
          </label>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label class="field-label">Password
            <input type="password" v-model="form.password" required minlength="6" />
          </label>
          <label class="field-label">Ulangi Password
            <input type="password" v-model="form.confirm_password" required minlength="6" />
          </label>
        </div>

        <button type="submit" class="btn primary" :disabled="loading" style="margin-top:8px;">
          {{ loading ? 'Memproses...' : 'Daftar Sekarang' }}
        </button>
      </form>

      <div style="margin-top:20px; text-align:center; font-size:13px;">
        <span style="color:var(--text-soft);">Sudah punya akun?</span>
        <router-link to="/login" class="link-action" style="margin-left:6px;">Masuk di sini</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo-pkm-erfat.png'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  role: 'PASIEN'
})

const loading = ref(false)
const errorMsg = ref('')

const handleRegister = async () => {
  if (form.password !== form.confirm_password) {
    errorMsg.value = 'Konfirmasi password tidak cocok'
    return
  }

  loading.value = true
  errorMsg.value = ''
  
  const result = await authStore.register(form)
  
  loading.value = false
  
  if (result.success) {
    router.push('/verify-email')
  } else {
    errorMsg.value = result.message
  }
}
</script>
