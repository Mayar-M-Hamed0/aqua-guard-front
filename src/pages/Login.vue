<template>
  <div class="login-container">
    <div class="login-background">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <i class="pi pi-shield" style="font-size: 3rem; color: #3b82f6;"></i>
        </div>
        <h1>AquaGuard AI</h1>
        <p>Water Quality Monitoring System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <InputText 
            id="email"
            v-model="credentials.email" 
            type="email"
            placeholder="Enter your email"
            :class="{ 'p-invalid': errors.email }"
            required
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <Password 
            id="password"
            v-model="credentials.password"
            placeholder="Enter your password"
            :feedback="false"
            :toggleMask="true"
            :class="{ 'p-invalid': errors.password }"
            required
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div class="form-options">
          <div class="remember-me">
            <Checkbox v-model="rememberMe" :binary="true" inputId="remember" />
            <label for="remember">Remember me</label>
          </div>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>

        <Button 
          type="submit" 
          label="Sign In" 
          :loading="loading"
          class="login-button"
          icon="pi pi-sign-in"
        />

        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>
      </form>

      <div class="login-footer">
        <p>Powered by Huawei Cloud</p>
        <p class="demo-note">Demo Credentials: admin@aquaguard.com / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Password from 'primevue/password'


const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errors = ref({})

const handleLogin = async () => {
  errors.value = {}
  errorMessage.value = ''
  
  if (!credentials.value.email) {
    errors.value.email = 'Email is required'
    return
  }
  
  if (!credentials.value.password) {
    errors.value.password = 'Password is required'
    return
  }

  loading.value = true

  try {
    await authStore.login(credentials.value.email, credentials.value.password)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.wave1 {
  animation: wave 8s linear infinite;
}

.wave2 {
  animation: wave 12s linear infinite;
  animation-delay: 2s;
}

.wave3 {
  animation: wave 16s linear infinite;
  animation-delay: 4s;
}

@keyframes wave {
  0% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-25%) translateY(-20px); }
  100% { transform: translateX(-50%) translateY(0); }
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.login-header p {
  color: #64748b;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #334155;
  font-size: 0.875rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

.demo-note {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f1f5f9;
  border-radius: 6px;
  color: #475569;
  font-size: 0.8rem;
}
</style>