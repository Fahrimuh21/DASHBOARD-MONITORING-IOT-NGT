<template>
  <div class="login-page">
    <div class="login-split">
      <div class="login-hero-panel">
        <div class="login-hero-text">
          <h2>Selamat Datang!</h2>
          <p>Belum memiliki akun?</p>
          <router-link to="/register" class="login-hero-btn">Daftar Sekarang</router-link>
        </div>
        <img :src="maskotUrl" alt="Maskot Naspiontech" class="login-hero-mascot" />
      </div>

      <div class="login-form-panel">
        <div class="login-brand">
          <div class="brand-mark logo-mark">
            <img :src="logoUrl" alt="Logo Naspiontech" />
          </div>
          <div>
            <h2 class="app-name">Naspiontech</h2>
          </div>
        </div>

        <h1>Masuk ke Akun</h1>
        <p class="login-subtitle">Silakan login untuk mengakses dashboard Naspiontech.</p>

        <form @submit.prevent="handleLogin" class="form">
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

          <div v-if="errorMsg" class="alert-box error" style="padding:7px 9px; font-size:11px; margin:0;">
            {{ errorMsg }}
          </div>

          <div>
            <label class="field-label">Email
              <input type="email" v-model="form.email" required placeholder="Masukkan email Anda" />
            </label>
          </div>
          <div>
            <label class="field-label">Password
              <input type="password" v-model="form.password" required placeholder="••••••••" />
            </label>
          </div>

          <button type="submit" class="btn primary" :disabled="loading" style="margin-top:4px;">
            {{ loading ? 'Memproses...' : 'Masuk Sekarang' }}
          </button>
        </form>

        <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:11px;">
          <router-link to="/register" class="link-action">Buat Akun Baru</router-link>
          <router-link to="/forgot-password" style="color:var(--text-soft);">Lupa Password?</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo-pkm-erfat.png'
import maskotUrl from '@/assets/MaskotNaspion.png'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  role: 'PASIEN'
})

const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  const result = await authStore.login(form.email, form.password, form.role)
  
  loading.value = false
  
  if (result.success) {
    router.push('/dashboard')
  } else if (result.needVerification) {
    router.push('/verify-email')
  } else {
    errorMsg.value = result.message
  }
}
</script>
