import { defineStore } from 'pinia'
import { locationsService } from '@/services/locations.service'

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    locations: [],
    currentLocation: null,
    mapData: [],
    loading: false,
  }),
  
  actions: {
    async fetchLocations(filters = {}) {
      this.loading = true
      try {
        const response = await locationsService.getAll(filters)
        this.locations = response.data
      } finally {
        this.loading = false
      }
    },
    
    async fetchMapData() {
      const response = await locationsService.getMapView()
      this.mapData = response.data
    },
    
    async createLocation(data) {
      const response = await locationsService.create(data)
      this.locations.push(response.data)
      return response.data
    },
    
    // ✅ أضف هذا الـ action
    async updateLocation(id, data) {
      const response = await locationsService.update(id, data)
      
      // تحديث الـ location في الـ array
      const index = this.locations.findIndex(loc => loc.id === id)
      if (index !== -1) {
        this.locations[index] = response.data
      }
      
      return response.data
    },
    
    // ✅ أضف هذا الـ action
    async deleteLocation(id) {
      await locationsService.delete(id)
      
      // حذف الـ location من الـ array
      this.locations = this.locations.filter(loc => loc.id !== id)
    },
  },
})
