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

          <!-- Dashboard Header -->
          <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
              <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold flex items-center gap-3">
                <i class="pi pi-chart-line text-blue-600"></i>
                Water Quality Dashboard
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Real-time monitoring and analysis of water quality across all locations</p>
            </div>

            <!-- Right: Actions -->
            <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
              <!-- Date Range Filter -->
              <Calendar v-model="dateRange" selectionMode="range" dateFormat="yy-mm-dd" :showIcon="true" class="w-72" />
              <Button label="Refresh" icon="pi pi-refresh" @click="refreshData" :loading="loading" severity="secondary" />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-96">
            <ProgressSpinner />
          </div>

          <!-- Dashboard Content -->
          <div v-else-if="overview" class="space-y-6">
            
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard 
                title="Total Locations"
                :value="overview.summary.total_locations"
                icon="pi pi-map-marker"
                color="blue"
                :trend="{ value: 12, direction: 'up' }"
              />
              
              <StatCard 
                title="Samples Collected"
                :value="overview.summary.total_samples"
                icon="pi pi-flask"
                color="green"
                subtitle="This period"
              />
              
              <StatCard 
                title="Average WQI"
                :value="overview.summary.average_wqi"
                icon="pi pi-chart-bar"
                color="purple"
                :status="getWQIStatus(overview.summary.average_wqi)"
              />
              
              <StatCard 
                title="Active Alerts"
                :value="overview.summary.active_alerts"
                icon="pi pi-bell"
                color="red"
                :critical="overview.summary.active_alerts > 0"
              />
              
              <StatCard 
                title="Critical Locations"
                :value="overview.summary.critical_locations"
                icon="pi pi-exclamation-triangle"
                color="orange"
              />
              
              <StatCard 
                title="Compliance Rate"
                :value="`${overview.summary.compliance_rate}%`"
                icon="pi pi-check-circle"
                color="teal"
              />
            </div>

            <!-- Interactive Map Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <i class="pi pi-map text-blue-600"></i>
                  Interactive Water Quality Map
                </h2>
                <SelectButton v-model="mapView" :options="mapViewOptions" optionLabel="label" />
              </div>
              <InteractiveMap 
                :locations="mapData" 
                :view="mapView.value"
                @marker-click="handleMarkerClick"
                class="h-[500px]"
              />
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- WQI Trends Chart -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">WQI Trends Over Time</h3>
                  <Select v-model="trendStandard" :options="wqiStandards" optionLabel="label" optionValue="value" class="w-48" />
                </div>
                <div class="h-72">
                  <Line :data="wqiTrendData" :options="chartOptions" />
                </div>
              </div>

              <!-- Quality Distribution -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quality Status Distribution</h3>
                <div class="h-56">
                  <Doughnut :data="qualityDistributionData" :options="doughnutOptions" />
                </div>
                <div class="mt-4 space-y-2">
                  <div v-for="(value, key) in overview.quality_distribution.data" :key="key" class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getQualityColor(key) }"></span>
                      <span class="text-gray-700 dark:text-gray-300">{{ formatStatus(key) }}</span>
                    </div>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">{{ value }} ({{ overview.quality_distribution.percentages[key] }}%)</span>
                  </div>
                </div>
              </div>

              <!-- Risk Levels -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Risk Level Analysis</h3>
                <div class="h-72">
                  <Bar :data="riskLevelData" :options="barChartOptions" />
                </div>
              </div>
            </div>

            <!-- Top Contaminated Locations -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <i class="pi pi-exclamation-circle text-red-600"></i>
                Critical Attention Required
              </h3>
              <div class="space-y-3">
                <div 
                  v-for="location in overview.top_contaminated_locations" 
                  :key="location.location_id"
                  class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                  @click="viewLocationDetails(location.location_id)"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ location.location_name }}</span>
                      <Badge :value="location.risk_level" :severity="getRiskSeverity(location.risk_level)" />
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span class="flex items-center gap-1">
                        <i class="pi pi-tag"></i>
                        {{ formatType(location.type) }}
                      </span>
                      <span>{{ location.location_code }}</span>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-center">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" 
                         :style="{ backgroundColor: getWQIColor(location.wqi) }">
                      {{ location.wqi }}
                    </div>
                    <span class="text-xs font-semibold mt-1">{{ getWQIStatus(location.wqi) }}</span>
                  </div>

                  <div class="flex gap-2 flex-wrap max-w-xs">
                    <Tag 
                      v-for="(risk, idx) in (Array.isArray(location.risk_factors) ? location.risk_factors : Object.values(location.risk_factors || {})).slice(0, 3)" 
                      :key="idx"
                      :value="risk.parameter"
                      severity="danger"
                      icon="pi pi-exclamation-triangle"
                    />
                  </div>

                  <Button icon="pi pi-arrow-right" text rounded />
                </div>
              </div>
            </div>

            <!-- Recent Alerts & Parameter Violations & Performance -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Recent Alerts -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <i class="pi pi-bell text-orange-600"></i>
                    Recent Alerts
                  </h3>
                  <Button label="View All" text size="small" @click="$router.push('/alerts')" />
                </div>
                <div class="space-y-3">
                  <div 
                    v-for="alert in overview.recent_alerts" 
                    :key="alert.id"
                    class="flex gap-3 p-3 rounded-lg border-l-4"
                    :class="{
                      'bg-red-50 dark:bg-red-900/20 border-red-500': alert.severity === 'critical',
                      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500': alert.severity === 'warning'
                    }"
                  >
                    <i :class="getAlertIcon(alert.severity)" class="text-lg"></i>
                    <div class="flex-1">
                      <div class="flex justify-between items-start mb-1">
                        <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ alert.location_name }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(alert.created_at) }}</span>
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">{{ alert.message }}</p>
                      <div class="flex items-center gap-2 text-xs">
                        <Tag :value="alert.parameter_name" severity="warning" size="small" />
                        <span class="text-gray-600 dark:text-gray-400">
                          Value: {{ alert.parameter_value }} (Limit: {{ alert.threshold_value }})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Parameter Violations -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <i class="pi pi-chart-line text-purple-600"></i>
                  Top Parameter Violations
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="violation in overview.parameter_violations.slice(0, 6)" 
                    :key="violation.parameter"
                    class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ formatParameter(violation.parameter) }}</span>
                      <Badge :value="violation.count" severity="danger" />
                    </div>
                    <div class="flex h-2 rounded-full overflow-hidden">
                      <div 
                        v-for="(count, severity) in violation.severity_distribution" 
                        :key="severity"
                        class="transition-all"
                        :class="{
                          'bg-red-500': severity === 'critical',
                          'bg-orange-500': severity === 'high',
                          'bg-yellow-500': severity === 'medium'
                        }"
                        :style="{ width: `${(count / violation.count) * 100}%` }"
                        :title="`${severity}: ${count}`"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Location Performance -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <i class="pi pi-trophy text-yellow-600"></i>
                  Best Performing Locations
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="(location, index) in overview.location_performance.slice(0, 5)" 
                    :key="location.location_id"
                    class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ location.location_name }}</div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">{{ location.governorate }}</div>
                    </div>
                    <div class="flex items-center gap-2 w-32">
                      <ProgressBar :value="location.performance_score" :showValue="false" class="flex-1" />
                      <span class="font-bold text-blue-600 text-sm">{{ location.performance_score }}</span>
                    </div>
                  </div>
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
import { ref, computed, onMounted, watch } from 'vue'
// import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useLocationsStore } from '@/stores/locations'
import { Line, Doughnut, Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend ,
  Filler
} from 'chart.js'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { getWQIColor, getWQIStatus, getRiskLevelColor } from '@/utils/wqi-colors'
import { formatDate, formatNumber } from '@/utils/formatters'
import { useRouter } from 'vue-router';
import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import InteractiveMap from '@/components/map/InteractiveMap.vue'

// Add dayjs plugin
dayjs.extend(relativeTime)

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
)

// const router = useRouter()
const dashboardStore = useDashboardStore()
const locationsStore = useLocationsStore()

// State
const sidebarOpen = ref(false)
const loading = ref(false)
const dateRange = ref([dayjs().subtract(30, 'day').toDate(), new Date()])
const mapView = ref('risk')
const trendStandard = ref('wqi_custom')

const mapViewOptions = [
  { label: 'Risk Level', value: 'risk' },
  { label: 'WQI Score', value: 'wqi' },
  { label: 'Quality Status', value: 'quality' }
]

const wqiStandards = [
  { label: 'Egyptian Standard', value: 'wqi_custom' },
  { label: 'WHO Standard', value: 'wqi_who' },
  { label: 'NSF Standard', value: 'wqi_nsf' },
  { label: 'CCME Standard', value: 'wqi_ccme' }
]

const router = useRouter(); 

// Computed
const overview = computed(() => dashboardStore.overview)
const mapData = computed(() => {
  return locationsStore.mapData || []; 
});
// WQI Trend Chart Data
const wqiTrendData = computed(() => {
  if (!overview.value?.wqi_trends?.timeline) return null
  
  const timeline = overview.value.wqi_trends.timeline
  
  return {
    labels: timeline.map(t => formatDate(t.date)),
    datasets: [{
      label: wqiStandards.find(s => s.value === trendStandard.value)?.label || 'WQI',
      data: timeline.map(t => t[trendStandard.value]),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
})

// Quality Distribution Data
const qualityDistributionData = computed(() => {
  if (!overview.value?.quality_distribution?.data) return null
  
  const data = overview.value.quality_distribution.data
  
  return {
    labels: Object.keys(data).map(k => formatStatus(k)),
    datasets: [{
      data: Object.values(data),
      backgroundColor: [
        '#22c55e', // excellent
        '#3b82f6', // good
        '#eab308', // fair
        '#f97316', // poor
        '#ef4444'  // very poor
      ]
    }]
  }
})

// Risk Level Data
const riskLevelData = computed(() => {
  if (!overview.value?.risk_levels) return null
  
  const risks = overview.value.risk_levels
  
  return {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      label: 'Number of Samples',
      data: [risks.low, risks.medium, risks.high, risks.critical],
      backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444']
    }]
  }
})

// Chart Options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    y: { beginAtZero: true, max: 100 }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}

// Methods

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      dashboardStore.fetchOverview(
        dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
        dayjs(dateRange.value[1]).format('YYYY-MM-DD')
      ),
      locationsStore.fetchMapData()
    ])
  } finally {
    loading.value = false
  }
}

const handleMarkerClick = (locationId) => {
  router.push(`/locations/${locationId}`)
}

const viewLocationDetails = (locationId) => {
  router.push(`/locations/${locationId}`)
}

const formatStatus = (status) => {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const formatType = (type) => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const formatParameter = (param) => {
  const names = {
    fecal_coliform: 'Fecal Coliform',
    e_coli: 'E. Coli',
    ph: 'pH Level',
    tds: 'Total Dissolved Solids',
    turbidity: 'Turbidity',
    nitrate: 'Nitrate',
    lead: 'Lead',
    dissolved_oxygen: 'Dissolved Oxygen'
  }
  return names[param] || param
}

const getQualityColor = (status) => {
  const colors = {
    excellent: '#22c55e',
    good: '#3b82f6',
    fair: '#eab308',
    poor: '#f97316',
    very_poor: '#ef4444'
  }
  return colors[status] || '#6b7280'
}

const getRiskSeverity = (risk) => {
  const severities = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return severities[risk] || 'info'
}

const getAlertIcon = (severity) => {
  const icons = {
    info: 'pi pi-info-circle',
    warning: 'pi pi-exclamation-triangle',
    critical: 'pi pi-times-circle',
    emergency: 'pi pi-ban'
  }
  return icons[severity] || 'pi pi-bell'
}

const formatTime = (date) => {
  return dayjs(date).fromNow()
}

// Watch date range changes
watch(dateRange, () => {
  refreshData()
})

// Initialize
onMounted(async () => {
  await refreshData();
});
</script>