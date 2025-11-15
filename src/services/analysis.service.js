import api from './api'
export const analysisService = {
  calculate: (data) => api.post('/analysis/calculate', data),
  compareStandards: (sampleId) => api.post('/analysis/compare', { sample_id: sampleId }),
  getStandards: () => api.get('/analysis/standards'),
  predictFuture: (locationId, daysAhead) => 
    api.post('/analysis/predict', { location_id: locationId, days_ahead: daysAhead }),
}