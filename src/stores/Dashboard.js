import { defineStore } from 'pinia'
import { dashboardService } from '@/services/dashboard.service'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    overview: null,
    regionalStats: [],
    loading: false,
    error: null,
  }),
  
  actions: {
    async fetchOverview(dateFrom, dateTo) {
      this.loading = true
      try {
        const response = await dashboardService.getOverview({ date_from: dateFrom, date_to: dateTo })
        this.overview = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async fetchRegionalStats() {
      try {
        const response = await dashboardService.getRegionalStats()
        this.regionalStats = response.data
      } catch (error) {
        this.error = error.message
      }
    },
  },
})