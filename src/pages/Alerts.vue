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
          <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <div class="mb-4 sm:mb-0">
              <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold flex items-center gap-3">
                <i class="pi pi-bell text-blue-600"></i>
                Water Quality Alerts
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage water quality alerts and notifications</p>
            </div>
            <div class="flex gap-2">
              <Button 
                label="Mark All Read" 
                icon="pi pi-check" 
                outlined
                @click="markAllAsRead"
                :disabled="unreadCount === 0"
              />
              <Button 
                label="Refresh" 
                icon="pi pi-refresh" 
                @click="loadAlerts"
              />
            </div>
          </div>

          <!-- Alert Statistics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <div class="flex items-center gap-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900 text-red-600">
                  <i class="pi pi-exclamation-circle text-2xl"></i>
                </div>
                <div>
                  <span class="block text-3xl font-bold text-gray-800 dark:text-gray-100">{{ stats.critical || 0 }}</span>
                  <span class="block text-sm text-gray-600 dark:text-gray-400">Critical Alerts</span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
              <div class="flex items-center gap-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600">
                  <i class="pi pi-exclamation-triangle text-2xl"></i>
                </div>
                <div>
                  <span class="block text-3xl font-bold text-gray-800 dark:text-gray-100">{{ stats.warning || 0 }}</span>
                  <span class="block text-sm text-gray-600 dark:text-gray-400">Warnings</span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div class="flex items-center gap-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600">
                  <i class="pi pi-info-circle text-2xl"></i>
                </div>
                <div>
                  <span class="block text-3xl font-bold text-gray-800 dark:text-gray-100">{{ stats.info || 0 }}</span>
                  <span class="block text-sm text-gray-600 dark:text-gray-400">Info Alerts</span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
              <div class="flex items-center gap-4">
                <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600">
                  <i class="pi pi-envelope text-2xl"></i>
                </div>
                <div>
                  <span class="block text-3xl font-bold text-gray-800 dark:text-gray-100">{{ unreadCount }}</span>
                  <span class="block text-sm text-gray-600 dark:text-gray-400">Unread</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Severity</label>
                <Select 
                  v-model="filters.severity" 
                  :options="severityOptions" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Severities"
                  showClear
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Location</label>
                <Select 
                  v-model="filters.location_id" 
                  :options="locations" 
                  optionLabel="name"
                  optionValue="id"
                  placeholder="All Locations"
                  showClear
                  filter
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Status</label>
                <Select 
                  v-model="filters.is_resolved" 
                  :options="resolvedOptions" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Status"
                  showClear
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Alert Type</label>
                <Select 
                  v-model="filters.alert_type" 
                  :options="alertTypes" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Types"
                  showClear
                />
              </div>

              <div class="flex gap-2">
                <Button label="Apply" icon="pi pi-filter" @click="loadAlerts" class="flex-1" />
                <Button label="Clear" icon="pi pi-times" outlined @click="clearFilters" class="flex-1" />
              </div>
            </div>
          </div>

          <!-- Alerts Timeline -->
          <div class="space-y-6">
            
            <!-- Unread Alerts Section -->
            <div v-if="unreadAlerts.length" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
                <i class="pi pi-envelope text-blue-600"></i>
                Unread Alerts ({{ unreadAlerts.length }})
              </h3>
              <div class="space-y-3">
                <AlertCard 
                  v-for="alert in unreadAlerts" 
                  :key="alert.id"
                  :alert="alert"
                  @mark-read="markAsRead(alert.id)"
                  @resolve="showResolveDialog(alert)"
                  @view-sample="viewSample(alert.sample_id)"
                  @view-location="viewLocation(alert.location_id)"
                />
              </div>
            </div>

            <!-- All Alerts Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
                <i class="pi pi-history text-blue-600"></i>
                All Alerts
              </h3>

              <div v-if="loading" class="flex justify-center items-center py-12">
                <ProgressSpinner />
              </div>

              <div v-else class="space-y-3">
                <AlertCard 
                  v-for="alert in alerts" 
                  :key="alert.id"
                  :alert="alert"
                  @mark-read="markAsRead(alert.id)"
                  @resolve="showResolveDialog(alert)"
                  @delete="confirmDelete(alert)"
                  @view-sample="viewSample(alert.sample_id)"
                  @view-location="viewLocation(alert.location_id)"
                />
              </div>

              <!-- Pagination -->
              <div v-if="pagination" class="mt-6 flex justify-center">
                <Paginator 
                  :rows="pagination.per_page"
                  :totalRecords="pagination.total"
                  @page="onPage"
                />
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>

    <!-- Resolve Alert Dialog -->
    <Dialog 
      v-model:visible="showResolve" 
      header="Resolve Alert"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div v-if="selectedAlert" class="space-y-4">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <Tag :value="selectedAlert.severity" :severity="getSeverityClass(selectedAlert.severity)" class="mb-3" />
          <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-2">{{ selectedAlert.message }}</h4>
          <p class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <i class="pi pi-map-marker"></i>
            {{ selectedAlert.location?.name }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Resolution Notes</label>
          <Textarea 
            v-model="resolutionNotes" 
            rows="4" 
            placeholder="Enter details about how this alert was resolved..."
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="showResolve = false" />
        <Button 
          label="Mark as Resolved" 
          icon="pi pi-check"
          :loading="resolving"
          @click="resolveAlert"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { alertsService } from '@/services/alerts.service'
import { useLocationsStore } from '@/stores/locations'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import AlertCard from '@/components/alerts/AlertCard.vue'
import Paginator from 'primevue/paginator';

import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const locationsStore = useLocationsStore()

const sidebarOpen = ref(false)
const loading = ref(false)
const resolving = ref(false)
const showResolve = ref(false)
const selectedAlert = ref(null)
const resolutionNotes = ref('')
const alerts = ref([])
const unreadAlerts = ref([])
const pagination = ref(null)
const stats = ref({})

const filters = ref({
  severity: null,
  location_id: null,
  is_resolved: null,
  alert_type: null
})

const severityOptions = [
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'Emergency', value: 'emergency' }
]

const resolvedOptions = [
  { label: 'Unresolved', value: false },
  { label: 'Resolved', value: true }
]

const alertTypes = [
  { label: 'Parameter Exceeded', value: 'parameter_exceeded' },
  { label: 'High Contamination', value: 'high_contamination' },
  { label: 'System Alert', value: 'system_alert' }
]

const locations = computed(() => locationsStore.locations)
const unreadCount = computed(() => unreadAlerts.value.length)

onMounted(async () => {
  await loadInitialData()
})

const loadInitialData = async () => {
  await Promise.all([
    loadAlerts(),
    loadUnreadAlerts(),
    loadStatistics(),
    locationsStore.fetchLocations()
  ])
}

const loadAlerts = async () => {
  loading.value = true
  try {
    const response = await alertsService.getAll(filters.value)
    alerts.value = response.data.data
    pagination.value = response.data
  } finally {
    loading.value = false
  }
}

const loadUnreadAlerts = async () => {
  try {
    const response = await alertsService.getUnread()
    unreadAlerts.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const loadStatistics = async () => {
  try {
    const response = await alertsService.getStatistics()
    stats.value = response.data.by_severity
  } catch (error) {
    console.error(error)
  }
}

const clearFilters = () => {
  filters.value = {
    severity: null,
    location_id: null,
    is_resolved: null,
    alert_type: null
  }
  loadAlerts()
}

const onPage = (event) => {
  filters.value.page = event.page + 1
  loadAlerts()
}

const markAsRead = async (id) => {
  try {
    await alertsService.markAsRead(id)
    loadAlerts()
    loadUnreadAlerts()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const markAllAsRead = async () => {
  try {
    await alertsService.markAllRead()
    toast.add({ severity: 'success', summary: 'Success', detail: 'All alerts marked as read', life: 3000 })
    loadAlerts()
    loadUnreadAlerts()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const showResolveDialog = (alert) => {
  selectedAlert.value = alert
  resolutionNotes.value = ''
  showResolve.value = true
}

const resolveAlert = async () => {
  resolving.value = true
  try {
    await alertsService.resolve(selectedAlert.value.id, { resolution_notes: resolutionNotes.value })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Alert resolved', life: 3000 })
    showResolve.value = false
    loadAlerts()
    loadUnreadAlerts()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    resolving.value = false
  }
}

const confirmDelete = (alert) => {
  confirm.require({
    message: 'Delete this alert?',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteAlert(alert.id)
  })
}

const deleteAlert = async (id) => {
  try {
    await alertsService.delete(id)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Alert deleted', life: 3000 })
    loadAlerts()
    loadUnreadAlerts()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const viewSample = (sampleId) => {
  router.push(`/samples/${sampleId}`)
}

const viewLocation = (locationId) => {
  router.push(`/locations/${locationId}`)
}

const getSeverityClass = (severity) => {
  const classes = {
    critical: 'danger',
    emergency: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return classes[severity] || 'info'
}
</script>