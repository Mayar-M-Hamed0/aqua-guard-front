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
          <Breadcrumb :home="{ icon: 'pi pi-home', to: '/' }" :model="breadcrumbItems" class="mb-6" />

          <!-- Page Header -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-3 mb-2">
              <i class="pi pi-flask text-blue-600"></i>
              {{ editMode ? 'Edit Sample' : 'New Water Sample' }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400">Enter water quality parameters and analysis data</p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            
            <!-- Basic Information -->
            <Panel header="Basic Information" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Location *</label>
                  <Select 
                    v-model="form.location_id" 
                    :options="locations" 
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select location"
                    filter
                    :class="{ 'p-invalid': errors.location_id }"
                  />
                  <small v-if="errors.location_id" class="text-red-500">{{ errors.location_id }}</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Collection Date *</label>
                  <Calendar 
                    v-model="form.collection_date" 
                    dateFormat="yy-mm-dd"
                    showIcon
                    :class="{ 'p-invalid': errors.collection_date }"
                  />
                  <small v-if="errors.collection_date" class="text-red-500">{{ errors.collection_date }}</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Collection Time</label>
                  <Calendar 
                    v-model="form.collection_time" 
                    timeOnly
                    hourFormat="24"
                    showIcon
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Lab Name</label>
                  <InputText v-model="form.lab_name" placeholder="Enter lab name" />
                </div>
              </div>
            </Panel>

            <!-- Physical Parameters -->
            <Panel header="Physical Parameters" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperature (°C)</label>
                  <InputNumber v-model="form.temperature" :minFractionDigits="2" :maxFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Turbidity (NTU)</label>
                  <InputNumber v-model="form.turbidity" :minFractionDigits="2" :maxFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Color</label>
                  <InputText v-model="form.color" placeholder="e.g., Clear" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Odor Threshold</label>
                  <InputNumber v-model="form.odor_threshold" :minFractionDigits="2" :maxFractionDigits="2" />
                </div>
              </div>
            </Panel>

            <!-- Chemical Parameters - Basic -->
            <Panel header="Chemical Parameters - Basic" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">pH *</label>
                  <InputNumber 
                    v-model="form.ph" 
                    :minFractionDigits="2" 
                    :maxFractionDigits="2"
                    :min="0"
                    :max="14"
                    :class="{ 'p-invalid': errors.ph }"
                  />
                  <small class="text-xs text-gray-500 dark:text-gray-400 italic">Normal range: 6.5 - 8.5</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Electrical Conductivity (µS/cm)</label>
                  <InputNumber v-model="form.electrical_conductivity" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">TDS (mg/L)</label>
                  <InputNumber v-model="form.tds" :minFractionDigits="2" />
                  <small class="text-xs text-gray-500 dark:text-gray-400 italic">Max: 500 mg/L</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">TSS (mg/L)</label>
                  <InputNumber v-model="form.tss" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Hardness (mg/L)</label>
                  <InputNumber v-model="form.total_hardness" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Calcium (mg/L)</label>
                  <InputNumber v-model="form.calcium" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Magnesium (mg/L)</label>
                  <InputNumber v-model="form.magnesium" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Sodium (mg/L)</label>
                  <InputNumber v-model="form.sodium" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Chloride (mg/L)</label>
                  <InputNumber v-model="form.chloride" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Sulfate (mg/L)</label>
                  <InputNumber v-model="form.sulfate" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Alkalinity (mg/L)</label>
                  <InputNumber v-model="form.alkalinity" :minFractionDigits="2" />
                </div>
              </div>
            </Panel>

            <!-- Oxygen Parameters -->
            <Panel header="Oxygen Parameters" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Dissolved Oxygen (mg/L)</label>
                  <InputNumber v-model="form.dissolved_oxygen" :minFractionDigits="2" />
                  <small class="text-xs text-gray-500 dark:text-gray-400 italic">Min: 5 mg/L</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">BOD (mg/L)</label>
                  <InputNumber v-model="form.bod" :minFractionDigits="2" />
                  <small class="text-xs text-gray-500 dark:text-gray-400 italic">Biochemical Oxygen Demand</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">COD (mg/L)</label>
                  <InputNumber v-model="form.cod" :minFractionDigits="2" />
                  <small class="text-xs text-gray-500 dark:text-gray-400 italic">Chemical Oxygen Demand</small>
                </div>
              </div>
            </Panel>

            <!-- Nutrients -->
            <Panel header="Nutrients" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Nitrate (mg/L)</label>
                  <InputNumber v-model="form.nitrate" :minFractionDigits="2" />
                  <small class="text-xs text-gray-500 dark:text-gray-400 italic">Max: 50 mg/L</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Nitrite (mg/L)</label>
                  <InputNumber v-model="form.nitrite" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Ammonia (mg/L)</label>
                  <InputNumber v-model="form.ammonia" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Nitrogen (mg/L)</label>
                  <InputNumber v-model="form.total_nitrogen" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Phosphate (mg/L)</label>
                  <InputNumber v-model="form.phosphate" :minFractionDigits="2" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Phosphorus (mg/L)</label>
                  <InputNumber v-model="form.total_phosphorus" :minFractionDigits="2" />
                </div>
              </div>
            </Panel>

            <!-- Heavy Metals -->
            <Panel header="Heavy Metals (µg/L)" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Lead (Pb)</label>
                  <InputNumber v-model="form.lead" :minFractionDigits="4" />
                  <small class="text-xs text-red-600 dark:text-red-400 font-semibold">Max: 0.01 mg/L</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Mercury (Hg)</label>
                  <InputNumber v-model="form.mercury" :minFractionDigits="4" />
                  <small class="text-xs text-red-600 dark:text-red-400 font-semibold">Max: 0.001 mg/L</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Arsenic (As)</label>
                  <InputNumber v-model="form.arsenic" :minFractionDigits="4" />
                  <small class="text-xs text-red-600 dark:text-red-400 font-semibold">Max: 0.01 mg/L</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Cadmium (Cd)</label>
                  <InputNumber v-model="form.cadmium" :minFractionDigits="4" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Chromium (Cr)</label>
                  <InputNumber v-model="form.chromium" :minFractionDigits="4" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Copper (Cu)</label>
                  <InputNumber v-model="form.copper" :minFractionDigits="4" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Iron (Fe)</label>
                  <InputNumber v-model="form.iron" :minFractionDigits="4" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Manganese (Mn)</label>
                  <InputNumber v-model="form.manganese" :minFractionDigits="4" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Zinc (Zn)</label>
                  <InputNumber v-model="form.zinc" :minFractionDigits="4" />
                </div>
              </div>
            </Panel>

            <!-- Microbiological -->
            <Panel header="Microbiological Parameters (CFU/100ml)" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Coliform</label>
                  <InputNumber v-model="form.total_coliform" />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecal Coliform</label>
                  <InputNumber v-model="form.fecal_coliform" />
                  <small class="text-xs text-red-600 dark:text-red-400 font-semibold">Must be 0</small>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">E. Coli</label>
                  <InputNumber v-model="form.e_coli" />
                  <small class="text-xs text-red-600 dark:text-red-400 font-semibold">Must be 0</small>
                </div>
              </div>
            </Panel>

            <!-- Additional Notes -->
            <Panel header="Additional Information" :toggleable="true" class="bg-white dark:bg-gray-800">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
                <Textarea v-model="form.notes" rows="4" placeholder="Add any additional observations or notes..." />
              </div>
            </Panel>

            <!-- Action Buttons -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky bottom-4 z-50">
              <div class="flex justify-end gap-3">
                <Button 
                  label="Cancel" 
                  icon="pi pi-times" 
                  outlined
                  @click="$router.back()"
                />
                <Button 
                  label="Save Draft" 
                  icon="pi pi-save" 
                  severity="secondary"
                  outlined
                  @click="saveDraft"
                  :loading="saving"
                />
                <Button 
                  label="Submit & Analyze" 
                  icon="pi pi-check" 
                  type="submit"
                  :loading="saving"
                />
              </div>
            </div>
          </form>

        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocationsStore } from '@/stores/locations'
import { samplesService } from '@/services/samples.service'
import { useToast } from 'primevue/usetoast'

import Sidebar from '@/partials/Sidebar.vue'
import Header from '@/partials/Header.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const locationsStore = useLocationsStore()
const toast = useToast()

const sidebarOpen = ref(false)
const editMode = ref(false)
const saving = ref(false)
const errors = ref({})

const form = ref({
  location_id: null,
  collection_date: new Date(),
  collection_time: null,
  temperature: null,
  turbidity: null,
  color: '',
  odor_threshold: null,
  ph: null,
  electrical_conductivity: null,
  tds: null,
  tss: null,
  total_hardness: null,
  calcium: null,
  magnesium: null,
  sodium: null,
  potassium: null,
  chloride: null,
  sulfate: null,
  alkalinity: null,
  dissolved_oxygen: null,
  bod: null,
  cod: null,
  nitrate: null,
  nitrite: null,
  ammonia: null,
  total_nitrogen: null,
  phosphate: null,
  total_phosphorus: null,
  lead: null,
  mercury: null,
  arsenic: null,
  cadmium: null,
  chromium: null,
  copper: null,
  iron: null,
  manganese: null,
  zinc: null,
  total_coliform: null,
  fecal_coliform: null,
  e_coli: null,
  lab_name: '',
  notes: ''
})

const breadcrumbItems = computed(() => [
  { label: 'Samples', to: '/samples' },
  { label: editMode.value ? 'Edit Sample' : 'New Sample' }
])

const locations = computed(() => locationsStore.locations)

onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // Check permission
  if (!authStore.hasPermission('create_samples')) {
    router.push('/unauthorized')
    return
  }
  
  locationsStore.fetchLocations()
  
  if (route.query.location_id) {
    form.value.location_id = parseInt(route.query.location_id)
  }
  
  if (route.params.id) {
    editMode.value = true
    loadSample(route.params.id)
  }
})

const loadSample = async (id) => {
  try {
    const response = await samplesService.getById(id)
    Object.assign(form.value, response.data)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sample', life: 3000 })
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.location_id) {
    errors.value.location_id = 'Location is required'
  }
  
  if (!form.value.collection_date) {
    errors.value.collection_date = 'Collection date is required'
  }
  
  if (!form.value.ph && !form.value.tds && !form.value.turbidity) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Warning', 
      detail: 'Please enter at least one parameter', 
      life: 3000 
    })
    return false
  }
  
  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    if (editMode.value) {
      await samplesService.update(route.params.id, form.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Sample updated successfully', life: 3000 })
    } else {
      const response = await samplesService.create(form.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Sample created and analyzed', life: 3000 })
      router.push(`/samples/${response.data.id}`)
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    saving.value = false
  }
}

const saveDraft = async () => {
  form.value.status = 'draft'
  await submitForm()
}
</script>