import { defineStore } from 'pinia'
import api from '@/api'

export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [],
    unreadCount: 0,
    loading: false
  }),
  actions: {
    async fetchAlerts() {
      this.loading = true
      try {
        const { data } = await api.get('/alerts')
        if (data.success) {
          this.alerts = data.data.alerts
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async fetchUnreadCount() {
      try {
        const { data } = await api.get('/alerts/unread-count')
        if (data.success) {
          this.unreadCount = data.data.count
        }
      } catch (error) {
        console.error(error)
      }
    },
    async markAsRead(id) {
      try {
        await api.put(`/alerts/${id}/read`)
        await this.fetchUnreadCount()
        const alert = this.alerts.find(a => a.id === id)
        if (alert) alert.is_read = 1
      } catch (error) {
        console.error(error)
      }
    },
    async markAllAsRead() {
      try {
        await api.put('/alerts/read-all')
        await this.fetchUnreadCount()
        this.alerts.forEach(a => a.is_read = 1)
      } catch (error) {
        console.error(error)
      }
    }
  }
})
