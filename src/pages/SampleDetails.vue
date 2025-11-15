<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

    <!-- Sidebar -->
    <Sidebar :sidebarOpen="sidebarOpen" @close-sidebar="sidebarOpen = false" />

    <!-- Content area -->
    <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      
      <!-- Site header -->
      <Header :sidebarOpen="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="grow">
        <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">

          <!-- Breadcrumb -->
          <!-- <Breadcrumb :home="{ icon: 'pi pi-home', to: '/' }" :model="breadcrumbItems" class="mb-6" /> -->

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-96">
            <ProgressSpinner />
          </div>

          <!-- Sample Details -->
          <div v-else-if="sample" class="space-y-6">
            
            <!-- Header Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div class="flex items-center gap-6">
                  <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg">
                    <i class="pi pi-flask"></i>
                  </div>
                  <div>
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ sample.sample_code }}</h1>
                    <p class="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                      <i class="pi pi-map-marker"></i>
                      {{ sample.location.name }}
                    </p>
                    <div class="flex flex-wrap gap-2 mt-3">
                      <Tag :value="formatStatus(sample.quality_status)" :severity="getQualitySeverity(sample.quality_status)" />
                      <Tag :value="sample.risk_level" :severity="getRiskSeverity(sample.risk_level)" icon="pi pi-exclamation-triangle" />
                      <Badge :value="formatStatus(sample.status)" :severity="getStatusBadgeSeverity(sample.status)" />
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  <Button label="Edit" icon="pi pi-pencil" outlined @click="editSample" />
                  <Button label="Verify" icon="pi pi-check" v-if="sample.status !== 'verified'" @click="verifySample" />
                  <Button label="Download Report" icon="pi pi-download" outlined @click="downloadReport" />
                </div>
              </div>
            </div>

            <!-- WQI Scores -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Water Quality Index (WQI) Scores</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">WHO Standard</span>
                    <i class="pi pi-info-circle text-gray-400" v-tooltip.top="'World Health Organization'"></i>
                  </div>
                  <div class="text-5xl font-bold mb-2" :style="{ color: getWQIColor(sample.wqi_who) }">
                    {{ sample.wqi_who || 'N/A' }}
                  </div>
                  <div class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                    {{ getWQIStatus(sample.wqi_who) }}
                  </div>
                  <ProgressBar :value="Number(sample.wqi_who)" :showValue="false" :pt="{ value: { style: `background: ${getWQIColor(sample.wqi_who)}` } }" />
                </div>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">NSF WQI</span>
                    <i class="pi pi-info-circle text-gray-400" v-tooltip.top="'National Sanitation Foundation'"></i>
                  </div>
                  <div class="text-5xl font-bold mb-2" :style="{ color: getWQIColor(sample.wqi_nsf) }">
                    {{ sample.wqi_nsf || 'N/A' }}
                  </div>
                  <div class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                    {{ getWQIStatus(sample.wqi_nsf) }}
                  </div>
                  <ProgressBar :value="Number(sample.wqi_nsf)" :showValue="false" :pt="{ value: { style: `background: ${getWQIColor(sample.wqi_nsf)}` } }" />
                </div>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">CCME WQI</span>
                    <i class="pi pi-info-circle text-gray-400" v-tooltip.top="'Canadian Council'"></i>
                  </div>
                  <div class="text-5xl font-bold mb-2" :style="{ color: getWQIColor(sample.wqi_ccme) }">
                    {{ sample.wqi_ccme || 'N/A' }}
                  </div>
                  <div class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                    {{ getWQIStatus(sample.wqi_ccme) }}
                  </div>
                  <ProgressBar :value="Number(sample.wqi_ccme)" :showValue="false" :pt="{ value: { style: `background: ${getWQIColor(sample.wqi_ccme)}` } }" />
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">Egyptian Custom</span>
                    <i class="pi pi-star-fill text-blue-500"></i>
                  </div>
                  <div class="text-5xl font-bold mb-2" :style="{ color: getWQIColor(sample.wqi_custom) }">
                    {{ sample.wqi_custom || 'N/A' }}
                  </div>
                  <div class="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">
                    {{ getWQIStatus(sample.wqi_custom) }}
                  </div>
                  <ProgressBar :value="Number(sample.wqi_custom)" :showValue="false" :pt="{ value: { style: `background: ${getWQIColor(sample.wqi_custom)}` } }" />
                </div>
              </div>
            </div>

            <!-- Risk Factors -->
            <div v-if="sample.risk_factors && sample.risk_factors.length" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <i class="pi pi-exclamation-triangle text-red-600"></i>
                Risk Factors Detected
              </h3>
              <div class="space-y-3">
                <Message 
                  v-for="(risk, idx) in sample.risk_factors" 
                  :key="idx"
                  :severity="risk.severity === 'critical' ? 'error' : (risk.severity === 'high' ? 'warn' : 'info')"
                  :closable="false"
                >
                  <strong>{{ formatParameter(risk.parameter) }}:</strong> {{ risk.message }}
                </Message>
              </div>
            </div>

            <!-- AI Predictions -->
            <div v-if="sample.ai_predictions" class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <i class="pi pi-sparkles text-purple-600"></i>
                AI Analysis & Predictions
              </h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-32">Confidence Score:</span>
                  <ProgressBar :value="Number(sample.ai_confidence)" class="flex-1" />
                  <span class="text-sm font-bold text-purple-600 dark:text-purple-400 min-w-16">{{ sample.ai_confidence }}%</span>
                </div>
                <div v-if="sample.ai_recommendations" class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-2">Recommendations:</h4>
                  <p class="text-gray-700 dark:text-gray-300">{{ sample.ai_recommendations }}</p>
                </div>
              </div>
            </div>

            <!-- Parameters Tabs -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <TabView>
                <TabPanel header="Physical">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                    <ParameterCard label="Temperature" :value="sample.temperature" unit="°C" icon="pi pi-sun" />
                    <ParameterCard label="Turbidity" :value="sample.turbidity" unit="NTU" icon="pi pi-eye" :threshold="5" />
                    <ParameterCard label="Color" :value="sample.color" icon="pi pi-palette" />
                  </div>
                </TabPanel>

                <TabPanel header="Chemical">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                    <ParameterCard label="pH" :value="sample.ph" icon="pi pi-chart-line" :threshold="{ min: 6.5, max: 8.5 }" />
                    <ParameterCard label="TDS" :value="sample.tds" unit="mg/L" icon="pi pi-filter" :threshold="500" />
                    <ParameterCard label="Electrical Conductivity" :value="sample.electrical_conductivity" unit="µS/cm" icon="pi pi-bolt" />
                    <ParameterCard label="Total Hardness" :value="sample.total_hardness" unit="mg/L" icon="pi pi-shield" />
                    <ParameterCard label="Chloride" :value="sample.chloride" unit="mg/L" icon="pi pi-circle" :threshold="250" />
                    <ParameterCard label="Sulfate" :value="sample.sulfate" unit="mg/L" icon="pi pi-circle" :threshold="250" />
                  </div>
                </TabPanel>

                <TabPanel header="Oxygen">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <ParameterCard label="Dissolved Oxygen" :value="sample.dissolved_oxygen" unit="mg/L" icon="pi pi-cloud" :threshold="{ min: 5 }" />
                    <ParameterCard label="BOD" :value="sample.bod" unit="mg/L" icon="pi pi-chart-bar" />
                    <ParameterCard label="COD" :value="sample.cod" unit="mg/L" icon="pi pi-chart-bar" />
                  </div>
                </TabPanel>

                <TabPanel header="Nutrients">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                    <ParameterCard label="Nitrate" :value="sample.nitrate" unit="mg/L" icon="pi pi-circle" :threshold="50" />
                    <ParameterCard label="Nitrite" :value="sample.nitrite" unit="mg/L" icon="pi pi-circle" />
                    <ParameterCard label="Ammonia" :value="sample.ammonia" unit="mg/L" icon="pi pi-circle" />
                    <ParameterCard label="Phosphate" :value="sample.phosphate" unit="mg/L" icon="pi pi-circle" />
                  </div>
                </TabPanel>

                <TabPanel header="Heavy Metals">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                    <ParameterCard label="Lead (Pb)" :value="sample.lead" unit="mg/L" icon="pi pi-exclamation-triangle" :threshold="0.01" critical />
                    <ParameterCard label="Mercury (Hg)" :value="sample.mercury" unit="mg/L" icon="pi pi-exclamation-triangle" :threshold="0.001" critical />
                    <ParameterCard label="Arsenic (As)" :value="sample.arsenic" unit="mg/L" icon="pi pi-exclamation-triangle" :threshold="0.01" critical />
                    <ParameterCard label="Cadmium (Cd)" :value="sample.cadmium" unit="mg/L" icon="pi pi-exclamation-triangle" />
                    <ParameterCard label="Iron (Fe)" :value="sample.iron" unit="mg/L" icon="pi pi-circle" />
                  </div>
                </TabPanel>

                <TabPanel header="Microbiological">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <ParameterCard label="Total Coliform" :value="sample.total_coliform" unit="CFU/100ml" icon="pi pi-exclamation-circle" />
                    <ParameterCard label="Fecal Coliform" :value="sample.fecal_coliform" unit="CFU/100ml" icon="pi pi-exclamation-triangle" :threshold="0" critical />
                    <ParameterCard label="E. Coli" :value="sample.e_coli" unit="CFU/100ml" icon="pi pi-exclamation-triangle" :threshold="0" critical />
                  </div>
                </TabPanel>
              </TabView>
            </div>

            <!-- Additional Info -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Additional Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Collection Date</span>
                  <span class="text-base text-gray-800 dark:text-gray-100 font-semibold">{{ formatDateTime(sample.collection_date) }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Collected By</span>
                  <span class="text-base text-gray-800 dark:text-gray-100 font-semibold">{{ sample.collector?.name || 'N/A' }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Lab Name</span>
                  <span class="text-base text-gray-800 dark:text-gray-100 font-semibold">{{ sample.lab_name || 'N/A' }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Status</span>
                  <Badge :value="formatStatus(sample.status)" :severity="getStatusBadgeSeverity(sample.status)" />
                </div>
                <div v-if="sample.verified_by" class="flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Verified By</span>
                  <span class="text-base text-gray-800 dark:text-gray-100 font-semibold">{{ sample.verifier?.name }}</span>
                </div>
                <div v-if="sample.verified_at" class="flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Verified At</span>
                  <span class="text-base text-gray-800 dark:text-gray-100 font-semibold">{{ formatDateTime(sample.verified_at) }}</span>
                </div>
                <div v-if="sample.notes" class="col-span-full flex flex-col gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Notes</span>
                  <span class="text-base text-gray-700 dark:text-gray-300">{{ sample.notes }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSamplesStore } from '@/stores/samples'
import { samplesService } from '@/services/samples.service'
import { useToast } from 'primevue/usetoast'
import { getWQIColor, getWQIStatus } from '@/utils/wqi-colors'
import { formatDate, formatDateTime } from '@/utils/formatters'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Message from 'primevue/message';

import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'
import ParameterCard from '@/components/samples/ParameterCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const samplesStore = useSamplesStore()
const toast = useToast()

const sidebarOpen = ref(false)
const loading = ref(false)
const sample = computed(() => samplesStore.currentSample)

const breadcrumbItems = computed(() => [
  { label: 'Samples', to: '/samples' },
  { label: sample.value?.sample_code || 'Details' }
])

onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await loadSample()
})

const loadSample = async () => {
  loading.value = true
  try {
    await samplesStore.fetchSampleById(route.params.id)
  } finally {
    loading.value = false
  }
}

const editSample = () => {
  router.push(`/samples/${route.params.id}/edit`)
}

const verifySample = async () => {
  try {
    await samplesService.verify(route.params.id)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Sample verified', life: 3000 })
    loadSample()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const downloadReport = () => {
  toast.add({ severity: 'info', summary: 'Download', detail: 'Generating report...', life: 3000 })
}

const formatStatus = (status) => {
  return status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const formatParameter = (param) => {
  const names = {
    fecal_coliform: 'Fecal Coliform',
    e_coli: 'E. Coli',
    ph: 'pH Level',
    tds: 'TDS',
    turbidity: 'Turbidity',
    nitrate: 'Nitrate',
    lead: 'Lead',
    dissolved_oxygen: 'Dissolved Oxygen'
  }
  return names[param] || param
}

const getQualitySeverity = (status) => {
  const severities = {
    excellent: 'success',
    good: 'info',
    fair: 'warning',
    poor: 'danger',
    very_poor: 'danger'
  }
  return severities[status] || 'info'
}

const getRiskSeverity = (risk) => {
  const severities = { low: 'success', medium: 'warning', high: 'danger', critical: 'danger' }
  return severities[risk] || 'info'
}

const getStatusBadgeSeverity = (status) => {
  const severities = {
    pending_analysis: 'warning',
    analyzed: 'info',
    verified: 'success',
    flagged: 'danger'
  }
  return severities[status] || 'info'
}
</script>