<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark logo-mark">
          <img :src="logoUrl" alt="Logo NGT-Safe CO2" />
        </div>
        <div>
          <h2 class="app-name">NGT-Safe CO2</h2>
          <span style="font-size:12px; color:var(--text-soft); font-weight:600;">Secure Portal</span>
        </div>
      </div>
      
      <h1>Selamat Datang</h1>
      <p class="login-subtitle">Silakan login untuk mengakses dashboard.</p>

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

        <div v-if="errorMsg" class="alert-box error" style="padding:10px; font-size:13px; margin:0;">
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

        <button type="submit" class="btn primary" :disabled="loading" style="margin-top:8px;">
          {{ loading ? 'Memproses...' : 'Masuk Sekarang' }}
        </button>
      </form>

      <div style="margin-top:20px; display:flex; justify-content:space-between; font-size:13px;">
        <router-link to="/register" class="link-action">Buat Akun Baru</router-link>
        <router-link to="/forgot-password" style="color:var(--text-soft);">Lupa Password?</router-link>
      </div>

      <p class="small-note">
        Akun demo:<br>
        pasien@iot.local / pasien123<br>
        perawat@iot.local / perawat123
      </p>
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
