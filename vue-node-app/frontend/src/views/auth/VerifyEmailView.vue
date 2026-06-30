<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo Naspiontech" />
        </div>
        <h2 class="app-name">Verifikasi Email</h2>
      </div>

      <!-- State: Berhasil diverifikasi -->
      <div v-if="isVerified" class="alert-box success" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
        {{ successMsg }}
      </div>

      <!-- State: Tidak ada sesi dan belum diverifikasi -->
      <div v-else-if="!email" class="alert-box error">
        Sesi verifikasi tidak valid. Silakan login kembali.
      </div>

      <!-- State: Normal — tampilkan form OTP -->
      <template v-else>
        <p class="login-subtitle">
          Masukkan 6 digit kode OTP yang telah dikirim ke email <strong>{{ email }}</strong>
        </p>

        <div v-if="errorMsg" class="alert-box error" style="padding:9px 11px; font-size:12px; margin:0 0 12px;">
          {{ errorMsg }}
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
                style="font-size:20px; text-align:center; letter-spacing:7px; font-family:monospace;"
              />
            </label>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:6px;">
            {{ loading ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
          </button>
        </form>
      </template>

      <div style="margin-top:16px; text-align:center; font-size:12px;">
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
const isVerified = ref(false)

const email = computed(() => authStore.pendingVerificationEmail)

const handleVerify = async () => {
  if (!email.value) return

  loading.value = true
  errorMsg.value = ''

  const result = await authStore.verifyEmail(email.value, otp.value)

  loading.value = false

  if (result.success) {
    isVerified.value = true
    successMsg.value = result.message || 'Email berhasil diverifikasi! Mengalihkan ke login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    errorMsg.value = result.message
  }
}
</script>
