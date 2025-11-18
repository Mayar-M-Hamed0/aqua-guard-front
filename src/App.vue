<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.token = 'dummy-token'
authStore.user = { name: 'Test User', role: 'admin',"permissions": [
        "view_dashboard",
        "create_samples",
        "manage_users"
      ] }

</script>
<template>
  <Toast position="top-right" />
  <router-view />
</template>

<script>
import './charts/ChartjsConfig';
</script>

