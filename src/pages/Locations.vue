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
                <i class="pi pi-map-marker text-blue-600"></i>
                Monitoring Locations
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Manage and monitor water quality sampling locations</p>
            </div>
            <Button label="Add Location" icon="pi pi-plus" @click="showAddDialog = true" />
          </div>

          <!-- Filters -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Location Type</label>
                <Select 
                  v-model="filters.type" 
                  :options="locationTypes" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Types"
                  showClear
                />
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Governorate</label>
                <Select 
                  v-model="filters.governorate" 
                  :options="governorates" 
                  placeholder="All Governorates"
                  showClear
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Status</label>
                <Select 
                  v-model="filters.is_active" 
                  :options="statusOptions" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Status"
                  showClear
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm text-gray-700 dark:text-gray-300">Search</label>
                <InputText 
                  v-model="filters.search" 
                  placeholder="Search locations..."
                  @keyup.enter="loadLocations"
                />
              </div>

              <div class="flex gap-2">
                <Button label="Apply" icon="pi pi-filter" @click="loadLocations" class="flex-1" />
                <Button label="Clear" icon="pi pi-times" outlined @click="clearFilters" class="flex-1" />
              </div>
            </div>
          </div>

          <!-- View Toggle -->
          <div class="mb-6">
            <SelectButton v-model="viewMode" :options="viewModes" optionLabel="label" optionValue="value">
              <template #option="{ option }">
                <i :class="option.icon"></i>
                <span class="ml-2">{{ option.label }}</span>
              </template>
            </SelectButton>
          </div>

          <!-- Map View -->
          <div v-if="viewMode === 'map'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" style="height: 600px;">
            <InteractiveMap 
              :locations="mapData" 
              view="wqi"
              @marker-click="viewLocationDetails"
            />
          </div>

          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="location in locations" :key="location.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-all">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center justify-center w-12 h-12 rounded-xl text-white text-2xl" 
                     :class="getLocationIconClass(location.type)">
                  <i :class="getLocationIcon(location.type)"></i>
                </div>
                <Badge 
                  :value="location.is_active ? 'Active' : 'Inactive'" 
                  :severity="location.is_active ? 'success' : 'danger'"
                />
              </div>

              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{{ location.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">{{ location.code }}</p>
              
              <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span class="flex items-center gap-1">
                  <i class="pi pi-tag"></i>
                  {{ formatType(location.type) }}
                </span>
                <span v-if="location.governorate" class="flex items-center gap-1">
                  <i class="pi pi-map"></i>
                  {{ location.governorate }}
                </span>
              </div>

              <Divider />

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Total Samples</span>
                  <span class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ location.total_samples || 0 }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Average WQI</span>
                  <span class="text-lg font-bold" :style="{ color: getWQIColor(location.average_wqi) }">
                    {{ location.average_wqi || 'N/A' }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Risk Level</span>
                  <Tag 
                    :value="location.current_risk_level || 'Unknown'" 
                    :severity="getRiskSeverity(location.current_risk_level)"
                    class="mt-1"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <Button label="View Details" icon="pi pi-eye" text class="flex-1" @click="viewLocationDetails(location.id)" />
                <Button icon="pi pi-pencil" text severity="secondary" @click="editLocation(location)" />
              </div>
            </div>
          </div>

          <!-- Table View -->
          <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <DataTable 
              :value="locations" 
              :loading="loading"
              stripedRows
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[10, 25, 50]"
              responsiveLayout="scroll"
            >
              <Column field="code" header="Code" sortable>
                <template #body="{ data }">
                  <span class="font-semibold font-mono text-blue-600">{{ data.code }}</span>
                </template>
              </Column>

              <Column field="name" header="Location Name" sortable>
                <template #body="{ data }">
                  <div class="flex items-center gap-3">
                    <i :class="getLocationIcon(data.type)" class="text-xl text-blue-600"></i>
                    <div>
                      <div class="font-semibold text-gray-800 dark:text-gray-100">{{ data.name }}</div>
                      <small class="text-gray-500 dark:text-gray-400">{{ data.address }}</small>
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="type" header="Type" sortable>
                <template #body="{ data }">
                  <Tag :value="formatType(data.type)" severity="info" />
                </template>
              </Column>

              <Column field="governorate" header="Governorate" sortable />

              <Column header="Total Samples" sortable>
                <template #body="{ data }">
                  <span class="font-semibold">{{ data.total_samples || 0 }}</span>
                </template>
              </Column>

              <Column header="Avg WQI" sortable>
                <template #body="{ data }">
                  <span 
                    v-if="data.average_wqi" 
                    class="px-3 py-1 rounded-full text-white font-semibold text-sm"
                    :style="{ backgroundColor: getWQIColor(data.average_wqi) }"
                  >
                    {{ data.average_wqi }}
                  </span>
                  <span v-else class="text-gray-400">N/A</span>
                </template>
              </Column>

              <Column header="Risk Level">
                <template #body="{ data }">
                  <Tag 
                    :value="data.current_risk_level || 'Unknown'" 
                    :severity="getRiskSeverity(data.current_risk_level)"
                  />
                </template>
              </Column>

              <Column field="is_active" header="Status">
                <template #body="{ data }">
                  <Badge 
                    :value="data.is_active ? 'Active' : 'Inactive'" 
                    :severity="data.is_active ? 'success' : 'danger'"
                  />
                </template>
              </Column>

              <Column header="Actions">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button 
                      icon="pi pi-eye" 
                      text 
                      rounded
                      severity="info"
                      @click="viewLocationDetails(data.id)"
                      v-tooltip.top="'View Details'"
                    />
                    <Button 
                      icon="pi pi-pencil" 
                      text 
                      rounded
                      severity="secondary"
                      @click="editLocation(data)"
                      v-tooltip.top="'Edit'"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      text 
                      rounded
                      severity="danger"
                      @click="confirmDelete(data)"
                      v-tooltip.top="'Delete'"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

        </div>
      </main>

    </div> 

    <!-- Add/Edit Location Dialog -->
    <Dialog 
      v-model:visible="showAddDialog" 
      :header="editMode ? 'Edit Location' : 'Add New Location'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300">Location Name *</label>
          <InputText v-model="locationForm.name" placeholder="Enter location name" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300">Type *</label>
          <Select 
            v-model="locationForm.type" 
            :options="locationTypes" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700 dark:text-gray-300">Latitude *</label>
            <InputNumber v-model="locationForm.latitude" :minFractionDigits="6" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700 dark:text-gray-300">Longitude *</label>
            <InputNumber v-model="locationForm.longitude" :minFractionDigits="6" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700 dark:text-gray-300">Governorate</label>
            <Select 
              v-model="locationForm.governorate" 
              :options="governorates" 
              placeholder="Select governorate"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700 dark:text-gray-300">City</label>
            <InputText v-model="locationForm.city" placeholder="Enter city" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300">Address</label>
          <Textarea v-model="locationForm.address" rows="2" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <Textarea v-model="locationForm.description" rows="3" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="showAddDialog = false" />
        <Button 
          :label="editMode ? 'Update' : 'Create'" 
          icon="pi pi-check"
          :loading="saving"
          @click="saveLocation"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocationsStore } from '@/stores/locations'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { getWQIColor, getRiskLevelColor } from '@/utils/wqi-colors'
import InteractiveMap from '@/components/map/InteractiveMap.vue'

import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'

const router = useRouter()
const locationsStore = useLocationsStore()
const confirm = useConfirm()
const toast = useToast()

const sidebarOpen = ref(false)
const loading = ref(false)
const saving = ref(false)
const viewMode = ref('table')
const showAddDialog = ref(false)
const editMode = ref(false)

const filters = ref({
  type: null,
  governorate: null,
  is_active: null,
  search: ''
})

const locationForm = ref({
  name: '',
  type: null,
  latitude: null,
  longitude: null,
  governorate: null,
  city: '',
  address: '',
  description: ''
})

const viewModes = [
  { label: 'Table', value: 'table', icon: 'pi pi-list' },
  { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' },
  { label: 'Map', value: 'map', icon: 'pi pi-map' }
]

const locationTypes = [
  { label: 'River', value: 'river' },
  { label: 'Lake', value: 'lake' },
  { label: 'Groundwater', value: 'groundwater' },
  { label: 'Sea', value: 'sea' },
  { label: 'Reservoir', value: 'reservoir' },
  { label: 'Treatment Plant', value: 'treatment_plant' },
  { label: 'Distribution Network', value: 'distribution_network' }
]

const governorates = [
  'Cairo', 'Giza', 'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef',
  'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Ismailia', 'Kafr El Sheikh',
  'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
  'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
  'South Sinai', 'Suez'
]

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
]

const locations = computed(() => locationsStore.locations)
const mapData = computed(() => locationsStore.mapData)

onMounted(() => {
  loadLocations()
  loadMapData()
})

const loadLocations = async () => {
  loading.value = true
  try {
    await locationsStore.fetchLocations(filters.value)
  } finally {
    loading.value = false
  }
}

const loadMapData = async () => {
  await locationsStore.fetchMapData()
}

const clearFilters = () => {
  filters.value = {
    type: null,
    governorate: null,
    is_active: null,
    search: ''
  }
  loadLocations()
}

const viewLocationDetails = (id) => {
  router.push(`/locations/${id}`)
}

const editLocation = (location) => {
  editMode.value = true
  locationForm.value = { ...location }
  showAddDialog.value = true
}

const saveLocation = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await locationsStore.updateLocation(locationForm.value.id, locationForm.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Location updated', life: 3000 })
    } else {
      await locationsStore.createLocation(locationForm.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Location created', life: 3000 })
    }
    showAddDialog.value = false
    resetForm()
    loadLocations()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (location) => {
  confirm.require({
    message: `Are you sure you want to delete ${location.name}?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteLocation(location.id)
  })
}

const deleteLocation = async (id) => {
  try {
    await locationsStore.deleteLocation(id)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Location deleted', life: 3000 })
    loadLocations()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const resetForm = () => {
  editMode.value = false
  locationForm.value = {
    name: '',
    type: null,
    latitude: null,
    longitude: null,
    governorate: null,
    city: '',
    address: '',
    description: ''
  }
}

const getLocationIcon = (type) => {
  const icons = {
    river: 'pi pi-arrow-right-arrow-left',
    lake: 'pi pi-circle',
    groundwater: 'pi pi-arrow-down',
    sea: 'pi pi-wave-pulse',
    reservoir: 'pi pi-database',
    treatment_plant: 'pi pi-building',
    distribution_network: 'pi pi-sitemap'
  }
  return icons[type] || 'pi pi-map-marker'
}

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
  return type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown'
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
</script>