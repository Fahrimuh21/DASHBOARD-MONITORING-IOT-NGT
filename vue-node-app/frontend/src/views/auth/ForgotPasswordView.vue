<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo Naspiontech" />
        </div>
        <h2 class="app-name">Lupa Password</h2>
      </div>

      <p class="login-subtitle">
        {{ step === 1 ? 'Masukkan email Anda untuk menerima kode OTP reset password.' : 'Masukkan kode OTP dan password baru Anda.' }}
      </p>

      <div v-if="errorMsg" class="alert-box error" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="alert-box success" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
        {{ successMsg }}
      </div>

      <!-- Step 1: Request OTP -->
      <form v-if="step === 1" @submit.prevent="handleRequestOtp" class="form">
        <div>
          <label class="field-label">Email
            <input type="email" v-model="email" required placeholder="Masukkan email terdaftar" />
          </label>
        </div>
        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Mengirim...' : 'Kirim Kode OTP' }}
        </button>
      </form>

      <!-- Step 2: Reset Password -->
      <form v-if="step === 2" @submit.prevent="handleResetPassword" class="form">
        <div v-if="devOtp" class="alert-box info" style="background:#f0f9ff; border:1px solid #bae6fd; font-family:monospace; margin-bottom:14px;">
          <small style="display:block; color:#0369a1; margin-bottom:4px;">[DEV MODE] OTP Reset Anda:</small>
          <strong style="font-size:16px; color:#0284c7; letter-spacing:4px;">{{ devOtp }}</strong>
        </div>

        <div>
          <label class="field-label">Kode OTP
            <input type="text" v-model="form.otp" required maxlength="6" style="letter-spacing:4px; text-align:center; font-family:monospace;" />
          </label>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <label class="field-label">Password Baru
            <input type="password" v-model="form.password" required minlength="6" />
          </label>
          <label class="field-label">Ulangi Password
            <input type="password" v-model="form.confirm_password" required minlength="6" />
          </label>
        </div>
        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Menyimpan...' : 'Simpan Password Baru' }}
        </button>
      </form>

      <div style="margin-top:16px; text-align:center; font-size:12px;">
        <router-link to="/login" class="link-action">Kembali ke Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import logoUrl from '@/assets/logo-pkm-erfat.png'

const router = useRouter()

const step = ref(1)
const email = ref('')
const devOtp = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  otp: '',
  password: '',
  confirm_password: ''
})

const handleRequestOtp = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const { data } = await api.post('/auth/forgot-password', { email: email.value })
    if (data.success) {
      step.value = 2
      successMsg.value = data.message
      if (data.data?.otp_dev) {
        devOtp.value = data.data.otp_dev
      }
    } else {
      errorMsg.value = data.message
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Gagal meminta OTP.'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (form.password !== form.confirm_password) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const { data } = await api.post('/auth/reset-password', {
      email: email.value,
      ...form
    })
    if (data.success) {
      successMsg.value = 'Password berhasil direset. Mengalihkan ke login...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMsg.value = data.message
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Gagal reset password.'
  } finally {
    loading.value = false
  }
}
</script>
