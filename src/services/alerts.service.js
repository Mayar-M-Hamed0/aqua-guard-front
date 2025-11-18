import api from './api'
export const alertsService = {
  getAll: (params) => api.get('/alerts', { params }),
  getUnread: () => api.get('/alerts/unread'),
  getStatistics: () => api.get('/alerts/statistics'),
  markAsRead: (id) => api.post(`/alerts/${id}/mark-read`),
  resolve: (id, notes) => api.post(`/alerts/${id}/resolve`, { resolution_notes: notes }),
  delete: (id) => api.delete(`/alerts/${id}`),
}