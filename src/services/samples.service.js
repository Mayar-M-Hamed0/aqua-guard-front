import api from './api'
export const samplesService = {
  getAll: (params) => api.get('/samples', { params }),
  getById: (id) => api.get(`/samples/${id}`),
  create: (data) => api.post('/samples', data),
  update: (id, data) => api.put(`/samples/${id}`, data),
  delete: (id) => api.delete(`/samples/${id}`),
  verify: (id) => api.post(`/samples/${id}/verify`),
  getMapData: (params) => api.get('/samples/map-data', { params }),
  import: (file, locationId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('location_id', locationId)
    return api.post('/samples/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}