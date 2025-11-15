<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

    <!-- Sidebar -->
    <Sidebar :sidebarOpen="sidebarOpen" @close-sidebar="sidebarOpen = false" />

    <!-- Content area -->
    <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      
      <!-- Site header -->
      <Header :sidebarOpen="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="grow">
        <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

          <!-- Page Header -->
          <div class="mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold flex items-center gap-3">
              <i class="pi pi-chart-line text-blue-600"></i>
              Water Quality Analysis
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Advanced analysis and WQI comparison tools</p>
          </div>

          <div class="space-y-6">
            
            <!-- Quick Analysis Tool -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-2">
                <i class="pi pi-bolt text-blue-600"></i>
                Quick WQI Calculator
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">Enter water parameters to calculate WQI instantly</p>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">pH</label>
                  <InputNumber v-model="quickCalc.ph" :minFractionDigits="2" :maxFractionDigits="2" :min="0" :max="14" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">TDS (mg/L)</label>
                  <InputNumber v-model="quickCalc.tds" :minFractionDigits="2" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Turbidity (NTU)</label>
                  <InputNumber v-model="quickCalc.turbidity" :minFractionDigits="2" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Dissolved Oxygen (mg/L)</label>
                  <InputNumber v-model="quickCalc.dissolved_oxygen" :minFractionDigits="2" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Nitrate (mg/L)</label>
                  <InputNumber v-model="quickCalc.nitrate" :minFractionDigits="2" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Fecal Coliform (CFU/100ml)</label>
                  <InputNumber v-model="quickCalc.fecal_coliform" />
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <Button label="Clear" icon="pi pi-times" outlined @click="clearQuickCalc" />
                <Button label="Calculate WQI" icon="pi pi-calculator" :loading="calculating" @click="calculateWQI" />
              </div>

              <!-- Results -->
              <div v-if="calculationResult" class="mt-6">
                <Divider />
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Results</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div v-for="(wqi, standard) in calculationResult.wqi_results" :key="standard" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ wqi.description }}</div>
                    <div class="text-4xl font-bold mb-2" :style="{ color: getWQIColor(wqi.value) }">{{ wqi.value }}</div>
                    <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{{ wqi.status }}</div>
                    <ProgressBar :value="wqi.value" :showValue="false" :pt="{ value: { style: `background: ${getWQIColor(wqi.value)}` } }" />
                  </div>
                </div>

                <div class="flex items-center gap-6 mb-6">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Quality Status:</span>
                    <Tag :value="formatStatus(calculationResult.quality_status)" :severity="getQualitySeverity(calculationResult.quality_status)" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Risk Level:</span>
                    <Tag :value="calculationResult.risk_level" :severity="getRiskSeverity(calculationResult.risk_level)" />
                  </div>
                </div>

                <div v-if="calculationResult.risk_factors.length" class="mb-6">
                  <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-3">Risk Factors:</h4>
                  <Message v-for="(risk, idx) in calculationResult.risk_factors" :key="idx" :severity="risk.severity === 'critical' ? 'error' : 'warn'" :closable="false" class="mb-2">
                    <strong>{{ risk.parameter }}:</strong> {{ risk.message }}
                  </Message>
                </div>

                <div v-if="calculationResult.recommendations.length">
                  <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-3">Recommendations:</h4>
                  <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li v-for="(rec, idx) in calculationResult.recommendations" :key="idx">{{ rec }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Compare Samples -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
                <i class="pi pi-clone text-blue-600"></i>
                Compare Water Samples
              </h2>

              <div class="flex gap-4 items-end mb-6">
                <div class="flex-1 flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Select Sample to Compare</label>
                  <Select 
                    v-model="selectedSampleForComparison" 
                    :options="recentSamples" 
                    optionLabel="sample_code"
                    optionValue="id"
                    placeholder="Choose a sample"
                    filter
                    @change="loadComparison"
                  />
                </div>
                <Button label="Load Comparison" icon="pi pi-refresh" @click="loadComparison" :disabled="!selectedSampleForComparison" />
              </div>

              <div v-if="comparison">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-2">{{ comparison.sample_info.code }}</h4>
                  <p class="text-gray-600 dark:text-gray-400">{{ comparison.sample_info.location }}</p>
                  <small class="text-gray-500 dark:text-gray-400">{{ formatDate(comparison.sample_info.collection_date) }}</small>
                </div>

                <!-- Standards Comparison -->
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">WQI Standards Comparison</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div v-for="(data, standard) in comparison.standards_comparison" :key="standard" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div class="flex justify-between items-center mb-3">
                      <span class="font-semibold text-sm text-gray-700 dark:text-gray-300">{{ standard.toUpperCase() }}</span>
                      <i class="pi pi-check-circle text-lg" v-if="data.acceptable" style="color: #22c55e;"></i>
                      <i class="pi pi-times-circle text-lg" v-else style="color: #ef4444;"></i>
                    </div>
                    <div class="text-3xl font-bold mb-2" :style="{ color: getWQIColor(data.wqi) }">{{ data.wqi }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ data.status }}</div>
                    <div class="text-sm font-semibold text-blue-600">Grade: {{ data.grade }}</div>
                  </div>
                </div>

                <!-- Parameter Analysis -->
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Parameter Analysis</h3>
                <DataTable :value="comparisonParametersList" responsiveLayout="scroll" class="mb-6">
                  <Column field="category" header="Category"></Column>
                  <Column field="parameter" header="Parameter"></Column>
                  <Column field="value" header="Value">
                    <template #body="{ data }">
                      <span :class="{ 'text-red-600 font-bold': data.status === 'exceeded' }">{{ data.value }}</span>
                    </template>
                  </Column>
                  <Column field="status" header="Status">
                    <template #body="{ data }">
                      <Tag :value="data.status" :severity="data.status === 'acceptable' ? 'success' : 'danger'" />
                    </template>
                  </Column>
                </DataTable>

                <!-- Visual Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-4">WQI Standards Comparison</h4>
                    <Bar :data="comparisonChartData" :options="chartOptions" />
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-4">Parameter Radar</h4>
                    <Radar :data="radarChartData" :options="radarOptions" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Predict Future Quality -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
                <i class="pi pi-sparkles text-blue-600"></i>
                AI-Powered Quality Prediction
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Select Location</label>
                  <Select 
                    v-model="predictionForm.location_id" 
                    :options="locations" 
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Choose location"
                    filter
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Prediction Period (days)</label>
                  <Slider v-model="predictionForm.days_ahead" :min="7" :max="90" />
                  <small class="text-gray-500 dark:text-gray-400">{{ predictionForm.days_ahead }} days ahead</small>
                </div>
              </div>
              <Button label="Predict Future Quality" icon="pi pi-chart-line" :loading="predicting" @click="predictQuality" />

              <div v-if="prediction" class="mt-6">
                <Divider />
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Prediction Results</h3>
                  <Tag :value="`${prediction.confidence}% Confidence`" severity="info" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted WQI</div>
                    <div class="text-4xl font-bold mb-2" :style="{ color: getWQIColor(prediction.predicted_wqi) }">
                      {{ prediction.predicted_wqi }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">on {{ formatDate(prediction.prediction_date) }}</div>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Trend Direction</div>
                    <div class="flex items-center justify-center gap-2 text-2xl font-semibold mt-4" :class="getTrendClass(prediction.trend)">
                      <i :class="getTrendIcon(prediction.trend)"></i>
                      {{ formatTrend(prediction.trend) }}
                    </div>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">Risk Assessment</div>
                    <Tag :value="prediction.risk_assessment" :severity="getRiskSeverity(prediction.risk_assessment)" class="text-base px-4 py-2" />
                  </div>
                </div>

                <div class="mb-6 h-80">
                  <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-4">Timeline Forecast</h4>
                  <Line :data="predictionTimelineChart" :options="lineChartOptions" />
                </div>

                <div v-if="prediction.recommendations.length">
                  <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-3">AI Recommendations:</h4>
                  <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li v-for="(rec, idx) in prediction.recommendations" :key="idx">{{ rec }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- WQI Standards Reference -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
                <i class="pi pi-book text-blue-600"></i>
                WQI Standards Reference
              </h2>

              <Accordion :multiple="true">
                <AccordionTab v-for="(standard, key) in standards" :key="key" :header="standard.name">
                  <div class="space-y-4">
                    <p><strong>Code:</strong> {{ standard.code }}</p>
                    <p><strong>Description:</strong> {{ standard.description }}</p>
                    
                    <div v-if="standard.parameters">
                      <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-3">Parameters:</h4>
                      <DataTable :value="Object.entries(standard.parameters).map(([k, v]) => ({ param: k, ...v }))" responsiveLayout="scroll">
                        <Column field="param" header="Parameter"></Column>
                        <Column field="min" header="Min"></Column>
                        <Column field="max" header="Max"></Column>
                        <Column field="weight" header="Weight"></Column>
                      </DataTable>
                    </div>

                    <div v-if="standard.water_types">
                      <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-3">Applicable for:</h4>
                      <div class="flex gap-2 flex-wrap">
                        <Tag v-for="type in standard.water_types" :key="type" :value="type" />
                      </div>
                    </div>
                  </div>
                </AccordionTab>
              </Accordion>
            </div>

          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { analysisService } from '@/services/analysis.service'
import { samplesService } from '@/services/samples.service'
import { useLocationsStore } from '@/stores/locations'
import { useToast } from 'primevue/usetoast'
import { Bar, Line, Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler
} from 'chart.js'
import { getWQIColor, getWQIStatus } from '@/utils/wqi-colors'
import { formatDate } from '@/utils/formatters'
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Message from 'primevue/message';
import Slider from 'primevue/slider';
import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler
)
const toast = useToast()
const locationsStore = useLocationsStore()

const sidebarOpen = ref(false)
const calculating = ref(false)
const predicting = ref(false)
const calculationResult = ref(null)
const comparison = ref(null)
const prediction = ref(null)
const standards = ref(null)
const recentSamples = ref([])
const selectedSampleForComparison = ref(null)

const quickCalc = ref({
  ph: null,
  tds: null,
  turbidity: null,
  dissolved_oxygen: null,
  nitrate: null,
  fecal_coliform: null
})

const predictionForm = ref({
  location_id: null,
  days_ahead: 30
})

const locations = computed(() => locationsStore.locations)

const comparisonParametersList = computed(() => {
  if (!comparison.value?.parameter_analysis) return []
  
  const params = []
  Object.entries(comparison.value.parameter_analysis).forEach(([category, items]) => {
    Object.entries(items).forEach(([param, data]) => {
      params.push({
        category,
        parameter: param,
        value: data.value,
        status: data.status
      })
    })
  })
  return params
})

const comparisonChartData = computed(() => {
  if (!comparison.value) return null
  
  const standards = comparison.value.standards_comparison
  return {
    labels: Object.keys(standards).map(k => k.toUpperCase()),
    datasets: [{
      label: 'WQI Score',
      data: Object.values(standards).map(s => s.wqi),
      backgroundColor: Object.values(standards).map(s => getWQIColor(s.wqi))
    }]
  }
})

const radarChartData = computed(() => {
  if (!comparison.value?.visual_data?.radar_chart) return null
  
  const radar = comparison.value.visual_data.radar_chart
  return {
    labels: radar.labels,
    datasets: radar.datasets
  }
})

const predictionTimelineChart = computed(() => {
  if (!prediction.value?.timeline) return null
  
  return {
    labels: prediction.value.timeline.map(t => formatDate(t.date)),
    datasets: [{
      label: 'Predicted WQI',
      data: prediction.value.timeline.map(t => t.wqi),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
}

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, max: 100 } }
}

onMounted(async () => {
  await loadInitialData()
})

const loadInitialData = async () => {
  await locationsStore.fetchLocations()
  await loadStandards()
  await loadRecentSamples()
}

const loadStandards = async () => {
  try {
    const response = await analysisService.getStandards()
    standards.value = response.data
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load standards', life: 3000 })
  }
}

const loadRecentSamples = async () => {
  try {
    const response = await samplesService.getAll({ per_page: 50, sort_by: 'collection_date', sort_order: 'desc' })
    recentSamples.value = response.data.data
  } catch (error) {
    console.error(error)
  }
}

const calculateWQI = async () => {
  calculating.value = true
  try {
    const response = await analysisService.calculate(quickCalc.value)
    calculationResult.value = response.data
    toast.add({ severity: 'success', summary: 'Success', detail: 'WQI calculated successfully', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    calculating.value = false
  }
}

const clearQuickCalc = () => {
  quickCalc.value = {
    ph: null,
    tds: null,
    turbidity: null,
    dissolved_oxygen: null,
    nitrate: null,
    fecal_coliform: null
  }
  calculationResult.value = null
}

const loadComparison = async () => {
  if (!selectedSampleForComparison.value) return
  
  try {
    const response = await analysisService.compareStandards(selectedSampleForComparison.value)
    comparison.value = response.data
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const predictQuality = async () => {
  if (!predictionForm.value.location_id) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a location', life: 3000 })
    return
  }
  
  predicting.value = true
  try {
    const response = await analysisService.predictFuture(
      predictionForm.value.location_id,
      predictionForm.value.days_ahead
    )
    prediction.value = response.data
    toast.add({ severity: 'success', summary: 'Success', detail: 'Prediction generated', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    predicting.value = false
  }
}

const formatStatus = (status) => {
  return status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const formatTrend = (trend) => {
  const labels = { improving: 'Improving', declining: 'Declining', stable: 'Stable' }
  return labels[trend] || trend
}

const getTrendIcon = (trend) => {
  const icons = { improving: 'pi pi-arrow-up', declining: 'pi pi-arrow-down', stable: 'pi pi-minus' }
  return icons[trend] || 'pi pi-minus'
}

const getTrendClass = (trend) => {
  const classes = {
    improving: 'text-green-600',
    declining: 'text-red-600',
    stable: 'text-gray-600'
  }
  return classes[trend] || 'text-gray-600'
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
</script>