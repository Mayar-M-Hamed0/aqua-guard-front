import api from './api'
export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/me'),
}