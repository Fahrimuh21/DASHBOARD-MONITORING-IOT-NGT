import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isInitialized: false,
    pendingVerificationEmail: null,
    otpDevDisplay: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isNurse: (state) => state.user?.role === 'PERAWAT',
    isPatient: (state) => state.user?.role === 'PASIEN',
  },
  actions: {
    async checkAuth() {
      try {
        const { data } = await api.get('/auth/me')
        if (data.success) {
          this.user = data.data.user
        } else {
          this.user = null
        }
      } catch (error) {
        this.user = null
      } finally {
        this.isInitialized = true
      }
    },
    async login(email, password, role) {
      try {
        const { data } = await api.post('/auth/login', { email, password, role })
        if (data.success) {
          this.user = data.data.user
          return { success: true }
        }
        return { success: false, message: data.message }
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.data?.need_verification) {
          this.pendingVerificationEmail = error.response.data.data.email
          this.otpDevDisplay = error.response.data.data.otp_dev
          return { success: false, needVerification: true, message: error.response.data.message }
        }
        return { success: false, message: error.response?.data?.message || 'Login gagal.' }
      }
    },
    async register(payload) {
      try {
        const { data } = await api.post('/auth/register', payload)
        if (data.success) {
          this.pendingVerificationEmail = data.data.email
          this.otpDevDisplay = data.data.otp_dev
          return { success: true }
        }
        return { success: false, message: data.message }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Registrasi gagal.' }
      }
    },
    async verifyEmail(email, otp) {
      try {
        const { data } = await api.post('/auth/verify-email', { email, otp })
        if (data.success) {
          this.pendingVerificationEmail = null
          this.otpDevDisplay = null
          return { success: true, message: data.message }
        }
        return { success: false, message: data.message }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Verifikasi gagal.' }
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error(error)
      } finally {
        this.user = null
      }
    }
  }
})
