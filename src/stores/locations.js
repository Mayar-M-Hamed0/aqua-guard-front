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
  },
})