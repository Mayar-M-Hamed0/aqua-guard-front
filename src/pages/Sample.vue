<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <Sidebar :sidebarOpen="sidebarOpen" @close-sidebar="sidebarOpen = false" />

    <!-- Content area -->
    <div
      class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden"
    >
      <!-- Site header -->
      <Header
        :sidebarOpen="sidebarOpen"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <main class="grow">
        <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          <!-- Page Header -->
          <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <div class="mb-4 sm:mb-0">
              <h1
                class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold flex items-center gap-3"
              >
                <i class="pi pi-flask text-blue-600"></i>
                Water Samples
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">
                View and manage water quality sample data
              </p>
            </div>

            <div
              class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2"
            >
              <Button
                label="Import Excel"
                icon="pi pi-upload"
                outlined
                @click="showImportDialog = true"
              />
              <Button
                label="Add Sample"
                icon="pi pi-plus"
                @click="$router.push('/samples/new')"
              />
            </div>
          </div>

          <!-- Quick Stats -->
          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
          >
            <div
              class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center"
            >
              <div
                class="text-3xl font-bold text-green-700 dark:text-green-400"
              >
                {{ stats.excellent }}
              </div>
              <div
                class="text-sm font-semibold text-green-600 dark:text-green-500 mt-1"
              >
                Excellent
              </div>
            </div>
            <div
              class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center"
            >
              <div class="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {{ stats.good }}
              </div>
              <div
                class="text-sm font-semibold text-blue-600 dark:text-blue-500 mt-1"
              >
                Good
              </div>
            </div>
            <div
              class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center"
            >
              <div
                class="text-3xl font-bold text-yellow-700 dark:text-yellow-400"
              >
                {{ stats.fair }}
              </div>
              <div
                class="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mt-1"
              >
                Fair
              </div>
            </div>
            <div
              class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center"
            >
              <div
                class="text-3xl font-bold text-orange-700 dark:text-orange-400"
              >
                {{ stats.poor }}
              </div>
              <div
                class="text-sm font-semibold text-orange-600 dark:text-orange-500 mt-1"
              >
                Poor
              </div>
            </div>
            <div
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center"
            >
              <div class="text-3xl font-bold text-red-700 dark:text-red-400">
                {{ stats.very_poor }}
              </div>
              <div
                class="text-sm font-semibold text-red-600 dark:text-red-500 mt-1"
              >
                Very Poor
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
            >
              <div class="flex flex-col gap-2">
                <label
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >Location</label
                >
                <Select
                  v-model="filters.location_id"
                  :options="locations"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="All Locations"
                  showClear
                  filter
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >Quality Status</label
                >
                <Select
                  v-model="filters.quality_status"
                  :options="qualityStatuses"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Statuses"
                  showClear
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >Risk Level</label
                >
                <Select
                  v-model="filters.risk_level"
                  :options="riskLevels"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Levels"
                  showClear
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >Date Range</label
                >
                <Calendar
                  v-model="dateRange"
                  selectionMode="range"
                  dateFormat="yy-mm-dd"
                  showIcon
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >Sample Code</label
                >
                <InputText
                  v-model="filters.search"
                  placeholder="Search by code..."
                  @keyup.enter="loadSamples"
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2 justify-end">
                <div class="flex gap-2">
                  <Button
                    label="Search"
                    icon="pi pi-search"
                    @click="loadSamples"
                    class="flex-1"
                  />
                  <Button
                    label="Clear"
                    icon="pi pi-times"
                    outlined
                    @click="clearFilters"
                    class="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Samples Table -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <DataTable
              :value="samples"
              :loading="loading"
              stripedRows
              :paginator="true"
              :rows="15"
              :rowsPerPageOptions="[15, 25, 50, 100]"
              :totalRecords="pagination?.total"
              :lazy="true"
              @page="onPage"
              responsiveLayout="scroll"
              :rowClass="getRowClass"
              v-model:selection="selectedSamples"
              dataKey="id"
            >
              <template #header>
                <div class="flex justify-between items-center p-4">
                  <div
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100"
                  >
                    {{ pagination?.total || 0 }} Samples Found
                  </div>
                  <div class="flex gap-2">
                    <Button
                      label="Export Selected"
                      icon="pi pi-download"
                      outlined
                      size="small"
                      :disabled="!selectedSamples.length"
                      @click="exportSelected"
                    />
                    <Button
                      label="Delete Selected"
                      icon="pi pi-trash"
                      severity="danger"
                      outlined
                      size="small"
                      :disabled="!selectedSamples.length"
                      @click="deleteSelected"
                    />
                  </div>
                </div>
              </template>

              <Column selectionMode="multiple" headerStyle="width: 3rem" />

              <Column field="sample_code" header="Sample Code" sortable>
                <template #body="{ data }">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-flask text-blue-600"></i>
                    <span
                      class="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold"
                      @click="viewSample(data.id)"
                    >
                      {{ data.sample_code }}
                    </span>
                  </div>
                </template>
              </Column>

              <Column field="location.name" header="Location" sortable>
                <template #body="{ data }">
                  <div class="flex flex-col">
                    <span
                      class="font-medium text-gray-900 dark:text-gray-100"
                      >{{ data.location.name }}</span
                    >
                    <small class="text-gray-500 dark:text-gray-400">{{
                      data.location.code
                    }}</small>
                  </div>
                </template>
              </Column>

              <Column field="collection_date" header="Collection Date" sortable>
                <template #body="{ data }">
                  <span class="text-gray-700 dark:text-gray-300">{{
                    formatDate(data.collection_date)
                  }}</span>
                </template>
              </Column>

              <Column header="WQI Scores">
                <template #body="{ data }">
                  <div class="flex flex-col gap-1 text-sm">
                    <span>
                      WHO:
                      <strong :style="{ color: getWQIColor(data.wqi_who) }">{{
                        data.wqi_who || "N/A"
                      }}</strong>
                    </span>
                    <span>
                      EGY:
                      <strong
                        :style="{ color: getWQIColor(data.wqi_custom) }"
                        >{{ data.wqi_custom || "N/A" }}</strong
                      >
                    </span>
                  </div>
                </template>
              </Column>

              <Column field="quality_status" header="Quality" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="formatStatus(data.quality_status)"
                    :severity="getQualitySeverity(data.quality_status)"
                    :icon="getQualityIcon(data.quality_status)"
                  />
                </template>
              </Column>

              <Column field="risk_level" header="Risk" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.risk_level"
                    :severity="getRiskSeverity(data.risk_level)"
                    :icon="getRiskIcon(data.risk_level)"
                  />
                </template>
              </Column>

              <Column header="Key Parameters">
                <template #body="{ data }">
                  <div
                    class="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span>pH: {{ data.ph || "-" }}</span>
                    <span>TDS: {{ data.tds || "-" }}</span>
                    <span>Turb: {{ data.turbidity || "-" }}</span>
                  </div>
                </template>
              </Column>

              <Column field="status" header="Status">
                <template #body="{ data }">
                  <Badge
                    :value="formatStatus(data.status)"
                    :severity="getStatusSeverity(data.status)"
                  />
                </template>
              </Column>

              <Column header="Actions" frozen alignFrozen="right">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button
                      icon="pi pi-eye"
                      text
                      rounded
                      severity="info"
                      size="small"
                      @click="viewSample(data.id)"
                      v-tooltip.top="'View Details'"
                    />
                    <Button
                      icon="pi pi-chart-line"
                      text
                      rounded
                      severity="success"
                      size="small"
                      @click="analyzeSample(data.id)"
                      v-tooltip.top="'Analyze'"
                    />
                    <Button
                      icon="pi pi-check"
                      text
                      rounded
                      severity="success"
                      size="small"
                      @click="verifySample(data.id)"
                      v-tooltip.top="'Verify'"
                      v-if="data.status !== 'verified'"
                    />
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      size="small"
                      @click="confirmDeleteSample(data)"
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

    <!-- Import Dialog -->
    <Dialog
      v-model:visible="showImportDialog"
      header="Import Samples from Excel"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700"
            >Select Location</label
          >
          <Select
            v-model="importForm.location_id"
            :options="locations"
            optionLabel="name"
            optionValue="id"
            placeholder="Choose location"
            filter
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700"
            >Upload Excel File</label
          >
          <FileUpload
            mode="basic"
            accept=".xlsx,.xls,.csv"
            :maxFileSize="10000000"
            @select="onFileSelect"
            chooseLabel="Choose File"
          />
        </div>

        <Message severity="info" :closable="false">
          File must contain columns: pH, TDS, Turbidity, DO, Temperature, etc.
        </Message>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="showImportDialog = false" />
        <Button
          label="Import"
          icon="pi pi-upload"
          :loading="importing"
          :disabled="!importForm.location_id || !importForm.file"
          @click="importSamples"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSamplesStore } from "@/stores/samples";
import { useLocationsStore } from "@/stores/locations";
import { samplesService } from "@/services/samples.service";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { getWQIColor } from "@/utils/wqi-colors";
import { formatDate } from "@/utils/formatters";

import Sidebar from "@/partials/Sidebar.vue";
import Header from "@/partials/Header.vue";
import Button from "primevue/button";

const router = useRouter();
const authStore = useAuthStore();
const samplesStore = useSamplesStore();
const locationsStore = useLocationsStore();
const confirm = useConfirm();
const toast = useToast();

const sidebarOpen = ref(false);
const loading = ref(false);
const importing = ref(false);
const showImportDialog = ref(false);
const selectedSamples = ref([]);
const dateRange = ref([]);

const filters = ref({
  location_id: null,
  quality_status: null,
  risk_level: null,
  search: "",
  date_from: null,
  date_to: null,
});

const importForm = ref({
  location_id: null,
  file: null,
});

const qualityStatuses = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
  { label: "Very Poor", value: "very_poor" },
];

const riskLevels = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const samples = computed(() => samplesStore.samples);
const pagination = computed(() => samplesStore.pagination);
const locations = computed(() => locationsStore.locations);

const stats = computed(() => {
  const counts = { excellent: 0, good: 0, fair: 0, poor: 0, very_poor: 0 };
  samples.value.forEach((s) => {
    if (counts[s.quality_status] !== undefined) counts[s.quality_status]++;
  });
  return counts;
});

onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  loadSamples();
  locationsStore.fetchLocations();
});

watch(dateRange, (newRange) => {
  if (newRange && newRange.length === 2) {
    filters.value.date_from = newRange[0].toISOString().split("T")[0];
    filters.value.date_to = newRange[1].toISOString().split("T")[0];
  }
});

const loadSamples = async () => {
  loading.value = true;
  try {
    await samplesStore.fetchSamples(filters.value);
  } finally {
    loading.value = false;
  }
};

const onPage = (event) => {
  filters.value.page = event.page + 1;
  loadSamples();
};

const clearFilters = () => {
  filters.value = {
    location_id: null,
    quality_status: null,
    risk_level: null,
    search: "",
    date_from: null,
    date_to: null,
  };
  dateRange.value = [];
  loadSamples();
};

const viewSample = (id) => {
  router.push(`/samples/${id}`);
};

const analyzeSample = (id) => {
  router.push(`/analysis?sample_id=${id}`);
};

const verifySample = async (id) => {
  try {
    await samplesService.verify(id);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Sample verified",
      life: 3000,
    });
    loadSamples();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

const confirmDeleteSample = (sample) => {
  confirm.require({
    message: `Delete sample ${sample.sample_code}?`,
    header: "Confirm Deletion",
    icon: "pi pi-exclamation-triangle",
    accept: () => deleteSample(sample.id),
  });
};

const deleteSample = async (id) => {
  try {
    await samplesService.delete(id);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Sample deleted",
      life: 3000,
    });
    loadSamples();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

const deleteSelected = () => {
  confirm.require({
    message: `Delete ${selectedSamples.value.length} selected samples?`,
    header: "Confirm Deletion",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      for (const sample of selectedSamples.value) {
        await samplesService.delete(sample.id);
      }
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Samples deleted",
        life: 3000,
      });
      selectedSamples.value = [];
      loadSamples();
    },
  });
};

const exportSelected = () => {
  toast.add({
    severity: "info",
    summary: "Export",
    detail: "Exporting selected samples...",
    life: 3000,
  });
};

const onFileSelect = (event) => {
  importForm.value.file = event.files[0];
};

const importSamples = async () => {
  importing.value = true;
  try {
    await samplesService.import(
      importForm.value.file,
      importForm.value.location_id
    );
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Samples imported",
      life: 3000,
    });
    showImportDialog.value = false;
    loadSamples();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  } finally {
    importing.value = false;
  }
};

const getRowClass = (data) => {
  if (data.risk_level === "critical") return "bg-red-50 dark:bg-red-900/20";
  if (data.risk_level === "high") return "bg-orange-50 dark:bg-orange-900/20";
  return "";
};

const formatStatus = (status) => {
  return status
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

const getQualityIcon = (status) => {
  const icons = {
    excellent: "pi pi-check-circle",
    good: "pi pi-check",
    fair: "pi pi-minus-circle",
    poor: "pi pi-exclamation-circle",
    very_poor: "pi pi-times-circle",
  };
  return icons[status] || "pi pi-info-circle";
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

const getRiskIcon = (risk) => {
  const icons = {
    low: "pi pi-check-circle",
    medium: "pi pi-exclamation-triangle",
    high: "pi pi-exclamation-circle",
    critical: "pi pi-times-circle",
  };
  return icons[risk] || "pi pi-info-circle";
};

const getStatusSeverity = (status) => {
  const severities = {
    pending_analysis: "warning",
    analyzed: "info",
    verified: "success",
    flagged: "danger",
  };
  return severities[status] || "info";
};
</script>
