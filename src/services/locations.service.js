import api from './api'
export const locationsService = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  getStatistics: (id, params) => api.get(`/locations/${id}/statistics`, { params }),
  getMapView: () => api.get('/locations/map'),
}