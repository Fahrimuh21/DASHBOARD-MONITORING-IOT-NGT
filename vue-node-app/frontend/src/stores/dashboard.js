import { defineStore } from 'pinia'
import api from '@/api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    latestDevices: [],
    contacts: [],
    loading: false,
    error: null,
    pollingInterval: null
  }),
  actions: {
    async fetchLatestData() {
      try {
        const [readingsRes, contactsRes] = await Promise.all([
          api.get('/readings/latest'),
          api.get('/contacts/patient-contacts')
        ])
        
        if (readingsRes.data.success) {
          this.latestDevices = readingsRes.data.data.devices
        }
        if (contactsRes.data.success) {
          this.contacts = contactsRes.data.data.contacts
        }
        this.error = null
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat data dashboard'
      }
    },
    startPolling(intervalMs = 5000) {
      this.fetchLatestData()
      if (!this.pollingInterval) {
        this.pollingInterval = setInterval(() => {
          this.fetchLatestData()
        }, intervalMs)
      }
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    }
  }
})
