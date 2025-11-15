import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
  },
  
  actions: {
    async login(email, password) {
      const response = await authService.login(email, password)
      this.token = response.data.token
      this.user = response.data.user
      localStorage.setItem('token', this.token)
    },
    
    async fetchProfile() {
      const response = await authService.getProfile()
      this.user = response.data
    },
    
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
  },
})