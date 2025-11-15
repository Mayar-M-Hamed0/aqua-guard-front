import { defineStore } from 'pinia'
import { samplesService } from '@/services/samples.service'

export const useSamplesStore = defineStore('samples', {
  state: () => ({
    samples: [],
    currentSample: null,
    pagination: null,
    loading: false,
  }),
  
  actions: {
    async fetchSamples(filters = {}) {
      this.loading = true
      try {
        const response = await samplesService.getAll(filters)
        this.samples = response.data.data
        this.pagination = response.data
      } finally {
        this.loading = false
      }
    },
    
    async fetchSampleById(id) {
      this.loading = true
      try {
        const response = await samplesService.getById(id)
        this.currentSample = response.data
      } finally {
        this.loading = false
      }
    },
    
    async createSample(data) {
      const response = await samplesService.create(data)
      return response.data
    },
  },
})