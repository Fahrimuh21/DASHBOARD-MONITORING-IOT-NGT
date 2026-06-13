<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo NGT-Safe CO2" />
        </div>
        <h2 class="app-name">Verifikasi Email</h2>
      </div>

      <div v-if="!email" class="alert-box error">
        Sesi verifikasi tidak valid. Silakan login kembali.
      </div>

      <template v-else>
        <p class="login-subtitle">
          Masukkan 6 digit kode OTP yang telah dikirim ke email <strong>{{ email }}</strong>
        </p>

        <div v-if="devOtp" class="alert-box info" style="background:#f0f9ff; border:1px solid #bae6fd; font-family:monospace;">
          <small style="display:block; color:#0369a1; margin-bottom:4px;">[DEV MODE] OTP Anda:</small>
          <strong style="font-size:18px; color:#0284c7; letter-spacing:4px;">{{ devOtp }}</strong>
        </div>

        <div v-if="errorMsg" class="alert-box error" style="padding:10px; font-size:13px; margin:0 0 14px;">
          {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="alert-box success" style="padding:10px; font-size:13px; margin:0 0 14px;">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleVerify" class="form">
          <div>
            <label class="field-label">Kode OTP
              <input 
                type="text" 
                v-model="otp" 
                required 
                maxlength="6" 
                placeholder="000000"
                style="font-size:24px; text-align:center; letter-spacing:8px; font-family:monospace;"
              />
            </label>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:8px;">
            {{ loading ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
          </button>
        </form>
      </template>

      <div style="margin-top:20px; text-align:center; font-size:13px;">
        <router-link to="/login" class="link-action">Kembali ke Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo-pkm-erfat.png'

const router = useRouter()
const authStore = useAuthStore()

const otp = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const email = computed(() => authStore.pendingVerificationEmail)
const devOtp = computed(() => authStore.otpDevDisplay)

const handleVerify = async () => {
  if (!email.value) return
  
  loading.value = true
  errorMsg.value = ''
  
  const result = await authStore.verifyEmail(email.value, otp.value)
  
  loading.value = false
  
  if (result.success) {
    successMsg.value = 'Email berhasil diverifikasi! Mengalihkan ke login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    errorMsg.value = result.message
  }
}
</script>
