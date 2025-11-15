import api from './api'

export const dashboardService = {
  getOverview: (params) => api.get('/dashboard/overview', { params }),
  getRegionalStats: () => api.get('/dashboard/regional'),
  compareParameters: (locationIds, parameters) => 
    api.get('/dashboard/parameters/compare', { 
      params: { location_ids: locationIds, parameters } 
    }),
}