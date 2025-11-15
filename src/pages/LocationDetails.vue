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

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-96">
            <ProgressSpinner />
          </div>

          <!-- Location Details -->
          <div v-else-if="location" class="space-y-6">
            
            <!-- Header -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center w-20 h-20 rounded-2xl text-white text-4xl"
                       :class="getLocationIconClass(location.type)">
                    <i :class="getLocationIcon(location.type)"></i>
                  </div>
                  <div>
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ location.name }}</h1>
                    <p class="text-gray-500 dark:text-gray-400 font-mono mt-1">{{ location.code }}</p>
                    <div class="flex items-center gap-2 mt-3">
                      <Tag :value="formatType(location.type)" severity="info" />
                      <Tag v-if="location.governorate" :value="location.governorate" />
                      <Badge
                        :value="location.is_active ? 'Active' : 'Inactive'"
                        :severity="location.is_active ? 'success' : 'danger'"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex gap-2">
                  <Button label="Add Sample" icon="pi pi-plus" @click="addSample" />
                  <Button label="Edit" icon="pi pi-pencil" outlined />
                  <Button label="Generate Report" icon="pi pi-file-pdf" outlined />
                </div>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600">
                    <i class="pi pi-flask text-2xl"></i>
                  </div>
                  <div>
                    <span class="block text-sm text-gray-600 dark:text-gray-400">Total Samples</span>
                    <span class="block text-2xl font-bold text-gray-800 dark:text-gray-100">{{ statistics?.total_samples || 0 }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900 text-green-600">
                    <i class="pi pi-chart-line text-2xl"></i>
                  </div>
                  <div>
                    <span class="block text-sm text-gray-600 dark:text-gray-400">Average WQI</span>
                    <span class="block text-2xl font-bold" :style="{ color: getWQIColor(statistics?.average_wqi) }">
                      {{ statistics?.average_wqi || "N/A" }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600">
                    <i class="pi pi-exclamation-triangle text-2xl"></i>
                  </div>
                  <div>
                    <span class="block text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                    <Tag
                      :value="statistics?.current_risk_level || 'Unknown'"
                      :severity="getRiskSeverity(statistics?.current_risk_level)"
                      class="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600">
                    <i class="pi pi-trending-up text-2xl"></i>
                  </div>
                  <div>
                    <span class="block text-sm text-gray-600 dark:text-gray-400">Trend (30 days)</span>
                    <div class="flex items-center gap-2 mt-1" :class="getTrendClass(statistics?.trend_last_30_days?.direction)">
                      <i :class="getTrendIcon(statistics?.trend_last_30_days?.direction)"></i>
                      <span class="font-semibold">{{ formatTrend(statistics?.trend_last_30_days?.direction) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Left Column -->
              <div class="space-y-6">
                
                <!-- Location Info -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <i class="pi pi-info-circle text-blue-600"></i>
                    Location Information
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 block">Coordinates</span>
                      <span class="font-semibold text-gray-800 dark:text-gray-100">{{ location.latitude }}, {{ location.longitude }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 block">Type</span>
                      <span class="font-semibold text-gray-800 dark:text-gray-100">{{ formatType(location.type) }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 block">Governorate</span>
                      <span class="font-semibold text-gray-800 dark:text-gray-100">{{ location.governorate || "N/A" }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 block">City</span>
                      <span class="font-semibold text-gray-800 dark:text-gray-100">{{ location.city || "N/A" }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 block">Address</span>
                      <span class="font-semibold text-gray-800 dark:text-gray-100">{{ location.address || "N/A" }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 block">Description</span>
                      <span class="font-semibold text-gray-800 dark:text-gray-100">{{ location.description || "N/A" }}</span>
                    </div>
                  </div>
                </div>

                <!-- Map -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <i class="pi pi-map text-blue-600"></i>
                    Location Map
                  </h3>
                  <div ref="mapContainer" class="h-64 rounded-lg overflow-hidden"></div>
                </div>

                <!-- Quality Distribution -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quality Status Distribution</h3>
                  <div class="h-64">
                    <Doughnut
                      v-if="qualityDistributionData"
                      :data="qualityDistributionData"
                      :options="chartOptions"
                    />
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="lg:col-span-2 space-y-6">
                
                <!-- WQI Trends -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <i class="pi pi-chart-line text-blue-600"></i>
                      WQI Trends
                    </h3>
                    <Select
                      v-model="dateRange"
                      :options="dateRangeOptions"
                      optionLabel="label"
                    />
                  </div>
                  <div class="h-80">
                    <Line
                      v-if="trendChartData"
                      :data="trendChartData"
                      :options="lineChartOptions"
                    />
                  </div>
                </div>

                <!-- Parameter Comparison -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <i class="pi pi-sliders-h text-blue-600"></i>
                    Parameter Averages
                  </h3>
                  <div class="h-64">
                    <Bar
                      v-if="parameterChartData"
                      :data="parameterChartData"
                      :options="barChartOptions"
                    />
                  </div>
                </div>

                <!-- Recent Samples -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <i class="pi pi-list text-blue-600"></i>
                      Recent Samples
                    </h3>
                    <Button label="View All" text @click="viewAllSamples" />
                  </div>
                  <DataTable :value="location.samples" responsiveLayout="scroll">
                    <Column field="sample_code" header="Sample Code">
                      <template #body="{ data }">
                        <span class="text-blue-600 font-semibold cursor-pointer hover:underline" @click="viewSample(data.id)">
                          {{ data.sample_code }}
                        </span>
                      </template>
                    </Column>
                    <Column field="collection_date" header="Date">
                      <template #body="{ data }">
                        {{ formatDate(data.collection_date) }}
                      </template>
                    </Column>
                    <Column field="wqi_custom" header="WQI">
                      <template #body="{ data }">
                        <span
                          class="px-3 py-1 rounded-full text-white font-semibold text-sm"
                          :style="{ backgroundColor: getWQIColor(data.wqi_custom) }"
                        >
                          {{ data.wqi_custom }}
                        </span>
                      </template>
                    </Column>
                    <Column field="quality_status" header="Status">
                      <template #body="{ data }">
                        <Tag
                          :value="formatStatus(data.quality_status)"
                          :severity="getQualitySeverity(data.quality_status)"
                        />
                      </template>
                    </Column>
                  </DataTable>
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { locationsService } from "@/services/locations.service";
import { Line, Doughnut, Bar } from "vue-chartjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getWQIColor } from "@/utils/wqi-colors";
import { formatDate } from "@/utils/formatters";

import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'

const route = useRoute();
const router = useRouter();

const sidebarOpen = ref(false)
const loading = ref(false);
const location = ref(null);
const statistics = ref(null);
const dateRange = ref({ label: "Last 6 Months", value: 180 });
const mapContainer = ref(null);
const map = ref(null);

const breadcrumbItems = computed(() => [
  { label: "Locations", to: "/locations" },
  { label: location.value?.name || "Details" },
]);

const dateRangeOptions = [
  { label: "Last Month", value: 30 },
  { label: "Last 3 Months", value: 90 },
  { label: "Last 6 Months", value: 180 },
  { label: "Last Year", value: 365 },
];

const qualityDistributionData = computed(() => {
  if (!statistics.value?.quality_distribution) return null;

  const dist = statistics.value.quality_distribution;
  return {
    labels: Object.keys(dist).map((k) => formatStatus(k)),
    datasets: [
      {
        data: Object.values(dist),
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#eab308",
          "#f97316",
          "#ef4444",
        ],
      },
    ],
  };
});

const trendChartData = computed(() => {
  if (!statistics.value?.time_series) return null;

  const timeSeries = statistics.value.time_series;
  return {
    labels: timeSeries.map((t) => formatDate(t.date)),
    datasets: [
      {
        label: "WQI Score",
        data: timeSeries.map((t) => t.wqi_custom),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

const parameterChartData = computed(() => {
  if (!statistics.value?.parameter_averages) return null;

  const params = statistics.value.parameter_averages;
  return {
    labels: Object.keys(params).map((k) => k.toUpperCase()),
    datasets: [
      {
        label: "Average Values",
        data: Object.values(params),
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#eab308",
          "#f97316",
          "#06b6d4",
          "#a855f7",
        ],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true } },
  scales: { y: { beginAtZero: true, max: 100 } },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

onMounted(async () => {
  await loadLocationDetails();
  initMap();
});

const loadLocationDetails = async () => {
  loading.value = true;
  try {
    const [locationRes, statsRes] = await Promise.all([
      locationsService.getById(route.params.id),
      locationsService.getStatistics(route.params.id, {
        date_from: new Date(
          Date.now() - dateRange.value.value * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        date_to: new Date().toISOString().split("T")[0],
      }),
    ]);
    location.value = locationRes.data.location;
    statistics.value = locationRes.data.statistics;
    console.log(locationRes.data);
  } finally {
    loading.value = false;
  }
};

const initMap = () => {
  if (!mapContainer.value || !location.value) return;
    
  map.value = L.map(mapContainer.value).setView(
    [location.value.latitude, location.value.longitude],
    13
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map.value);

  L.marker([location.value.latitude, location.value.longitude])
    .addTo(map.value)
    .bindPopup(`<b>${location.value.name}</b>`)
    .openPopup();
};

const addSample = () => {
  router.push(`/samples/new?location_id=${location.value.id}`);
};

const viewAllSamples = () => {
  router.push(`/samples?location_id=${location.value.id}`);
};

const viewSample = (id) => {
  router.push(`/samples/${id}`);
};

const getLocationIcon = (type) => {
  const icons = {
    river: "pi pi-arrow-right-arrow-left",
    lake: "pi pi-circle",
    groundwater: "pi pi-arrow-down",
    sea: "pi pi-wave-pulse",
    reservoir: "pi pi-database",
    treatment_plant: "pi pi-building",
    distribution_network: "pi pi-sitemap",
  };
  return icons[type] || "pi pi-map-marker";
};

const getLocationIconClass = (type) => {
  const classes = {
    river: 'bg-gradient-to-br from-purple-500 to-purple-700',
    lake: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    groundwater: 'bg-gradient-to-br from-green-500 to-green-700',
    sea: 'bg-gradient-to-br from-blue-600 to-blue-800',
    reservoir: 'bg-gradient-to-br from-teal-500 to-teal-700',
    treatment_plant: 'bg-gradient-to-br from-purple-600 to-purple-800',
    distribution_network: 'bg-gradient-to-br from-amber-500 to-orange-600'
  }
  return classes[type] || 'bg-gradient-to-br from-gray-500 to-gray-700'
}

const formatType = (type) => {
  return type
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatStatus = (status) => {
  return status
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatTrend = (trend) => {
  const labels = {
    improving: "Improving",
    declining: "Declining",
    stable: "Stable",
  };
  return labels[trend] || "Unknown";
};

const getTrendIcon = (trend) => {
  const icons = {
    improving: "pi pi-arrow-up",
    declining: "pi pi-arrow-down",
    stable: "pi pi-minus",
  };
  return icons[trend] || "pi pi-minus";
};

const getTrendClass = (trend) => {
  const classes = {
    improving: "text-green-600",
    declining: "text-red-600",
    stable: "text-gray-600",
  };
  return classes[trend] || "text-gray-600";
};

const getRiskSeverity = (risk) => {
  const severities = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };
  return severities[risk] || "info";
};

const getQualitySeverity = (status) => {
  const severities = {
    excellent: "success",
    good: "info",
    fair: "warning",
    poor: "danger",
    very_poor: "danger",
  };
  return severities[status] || "info";
};
</script>