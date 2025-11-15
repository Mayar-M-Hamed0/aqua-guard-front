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
                <i class="pi pi-file-pdf text-blue-600"></i>
                Analysis Reports
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">
                Generate and manage water quality reports
              </p>
            </div>
            <Button
              label="Generate New Report"
              icon="pi pi-plus"
              @click="showGenerateDialog = true"
            />
          </div>

          <!-- Report Templates -->
          <div class="mb-8">
            <h2
              class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4"
            >
              Report Templates
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                v-for="template in templates"
                :key="template.type"
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
                @click="selectTemplate(template)"
              >
                <div class="flex justify-center mb-4">
                  <div
                    class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                  >
                    <i
                      :class="getTemplateIcon(template.type)"
                      class="text-white text-3xl"
                    ></i>
                  </div>
                </div>
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2"
                >
                  {{ template.name }}
                </h3>
                <p
                  class="text-sm text-gray-600 dark:text-gray-400 text-center mb-4"
                >
                  {{ template.description }}
                </p>
                <Button
                  label="Use Template"
                  text
                  icon="pi pi-arrow-right"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Reports List -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h2
                class="text-xl font-semibold text-gray-800 dark:text-gray-100"
              >
                Generated Reports
              </h2>
              <div class="flex gap-2">
                <Select
                  v-model="filters.report_type"
                  :options="reportTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Types"
                  showClear
                  @change="loadReports"
                />
                <Select
                  v-model="filters.status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Status"
                  showClear
                  @change="loadReports"
                />
                <Button
                  label="Refresh"
                  icon="pi pi-refresh"
                  outlined
                  @click="loadReports"
                />
              </div>
            </div>

            <DataTable
              :value="reports"
              :loading="loading"
              stripedRows
              :paginator="true"
              :rows="15"
              responsiveLayout="scroll"
            >
              <Column field="report_code" header="Report Code" sortable>
                <template #body="{ data }">
                  <span class="font-mono font-semibold text-blue-600">{{
                    data.report_code
                  }}</span>
                </template>
              </Column>

              <Column field="title" header="Title" sortable>
                <template #body="{ data }">
                  <div>
                    <div class="font-semibold text-gray-800 dark:text-gray-100">
                      {{ data.title }}
                    </div>
                    <div
                      v-if="data.description"
                      class="text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{ data.description }}
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="report_type" header="Type" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="formatReportType(data.report_type)"
                    severity="info"
                  />
                </template>
              </Column>

              <Column header="Date Range">
                <template #body="{ data }">
                  <span v-if="data.start_date && data.end_date" class="text-sm">
                    {{ formatDate(data.start_date) }} -
                    {{ formatDate(data.end_date) }}
                  </span>
                  <span v-else class="text-gray-400">N/A</span>
                </template>
              </Column>

              <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                  <div class="flex items-center gap-2">
                    <ProgressSpinner
                      v-if="data.status === 'generating'"
                      style="width: 20px; height: 20px"
                    />
                    <Tag
                      v-else-if="data.status === 'completed'"
                      value="Completed"
                      severity="success"
                      icon="pi pi-check"
                    />
                    <Tag
                      v-else-if="data.status === 'failed'"
                      value="Failed"
                      severity="danger"
                      icon="pi pi-times"
                    />
                  </div>
                </template>
              </Column>

              <Column field="created_at" header="Generated" sortable>
                <template #body="{ data }">
                  <span class="text-sm">{{
                    formatDateTime(data.created_at)
                  }}</span>
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
                      @click="viewReport(data)"
                      :disabled="data.status !== 'completed'"
                      v-tooltip.top="'View & Download Report'"
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

    <!-- Generate Report Dialog -->
    <Dialog
      v-model:visible="showGenerateDialog"
      :header="selectedTemplate ? selectedTemplate.name : 'Generate Report'"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <div class="space-y-4">
        <!-- Template Selection -->
        <div v-if="!selectedTemplate" class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300"
            >Select Report Type *</label
          >
          <Select
            v-model="reportForm.report_type"
            :options="templates"
            optionLabel="name"
            optionValue="type"
            placeholder="Choose report type"
          />
        </div>

        <!-- Common Fields -->
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300"
            >Report Title *</label
          >
          <InputText
            v-model="reportForm.title"
            placeholder="Enter report title"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700 dark:text-gray-300"
            >Description</label
          >
          <Textarea
            v-model="reportForm.description"
            rows="3"
            placeholder="Optional description"
          />
        </div>

        <!-- Type-specific Fields -->
        <div
          v-if="reportForm.report_type === 'single_sample'"
          class="flex flex-col gap-2"
        >
          <label class="font-semibold text-gray-700 dark:text-gray-300"
            >Select Sample *</label
          >
          <Select
            v-model="reportForm.sample_id"
            :options="recentSamples"
            optionLabel="sample_code"
            optionValue="id"
            placeholder="Choose sample"
            filter
          />
        </div>

        <div
          v-if="
            ['location_trend', 'comparative'].includes(reportForm.report_type)
          "
        >
          <div class="flex flex-col gap-2 mb-4">
            <label class="font-semibold text-gray-700 dark:text-gray-300"
              >Select Locations *</label
            >
            <MultiSelect
              v-model="reportForm.location_ids"
              :options="locations"
              optionLabel="name"
              optionValue="id"
              placeholder="Choose locations"
              filter
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-700 dark:text-gray-300"
                >Start Date *</label
              >
              <Calendar
                v-model="reportForm.start_date"
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-700 dark:text-gray-300"
                >End Date *</label
              >
              <Calendar
                v-model="reportForm.end_date"
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
          </div>
        </div>

        <div v-if="reportForm.report_type === 'regional'">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-700 dark:text-gray-300"
                >Start Date *</label
              >
              <Calendar
                v-model="reportForm.start_date"
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-700 dark:text-gray-300"
                >End Date *</label
              >
              <Calendar
                v-model="reportForm.end_date"
                dateFormat="yy-mm-dd"
                showIcon
              />
            </div>
          </div>
        </div>

        <!-- Options -->
        <Divider />
        <h4 class="font-semibold text-gray-700 dark:text-gray-300">
          Report Options
        </h4>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="reportForm.include_charts"
              :binary="true"
              inputId="charts"
            />
            <label for="charts">Include Charts & Graphs</label>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              v-model="reportForm.include_recommendations"
              :binary="true"
              inputId="recommendations"
            />
            <label for="recommendations">Include AI Recommendations</label>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="preview" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Data Preview
          </h4>
          <div class="flex gap-6">
            <div>
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Samples:</span
              >
              <span class="ml-2 font-bold text-gray-800 dark:text-gray-100">{{
                preview.sample_count
              }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Locations:</span
              >
              <span class="ml-2 font-bold text-gray-800 dark:text-gray-100">{{
                preview.location_count
              }}</span>
            </div>
            <div v-if="preview.date_range">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Date Range:</span
              >
              <span class="ml-2 font-bold text-gray-800 dark:text-gray-100"
                >{{ preview.date_range.from }} to
                {{ preview.date_range.to }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="closeGenerateDialog" />
        <Button
          label="Preview Data"
          outlined
          @click="previewReport"
          :disabled="!canPreview"
        />
        <Button
          label="Generate Report"
          icon="pi pi-file-pdf"
          :loading="generating"
          @click="generateReport"
          :disabled="!canGenerate"
        />
      </template>
    </Dialog>

    <!-- PDF Report Component -->
    <PDFReportGenerator
      v-model:visible="showPDFDialog"
      :reportData="currentReport"
    />

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { reportsService } from "@/services/reports.service";
import { samplesService } from "@/services/samples.service";
import { useLocationsStore } from "@/stores/locations";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { formatDate, formatDateTime } from "@/utils/formatters";
import MultiSelect from "primevue/multiselect";
import Checkbox from "primevue/checkbox";

import Sidebar from "@/partials/Sidebar.vue";
import Header from "@/partials/Header.vue";
import PDFReportGenerator from "@/components/PDFReportGenerator.vue";

const confirm = useConfirm();
const toast = useToast();
const locationsStore = useLocationsStore();

const sidebarOpen = ref(false);
const loading = ref(false);
const generating = ref(false);
const showGenerateDialog = ref(false);
const showPDFDialog = ref(false);
const selectedTemplate = ref(null);
const currentReport = ref(null);
const reports = ref([]);
const templates = ref([]);
const recentSamples = ref([]);
const preview = ref(null);

const filters = ref({
  report_type: null,
  status: null,
});

const reportForm = ref({
  report_type: null,
  title: "",
  description: "",
  start_date: null,
  end_date: null,
  location_ids: [],
  sample_id: null,
  include_charts: true,
  include_recommendations: true,
});

const reportTypes = [
  { label: "Single Sample", value: "single_sample" },
  { label: "Location Trend", value: "location_trend" },
  { label: "Comparative", value: "comparative" },
  { label: "Regional", value: "regional" },
  { label: "Custom", value: "custom" },
];

const statusOptions = [
  { label: "Generating", value: "generating" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

const locations = computed(() => locationsStore.locations);

const canPreview = computed(() => {
  return (
    reportForm.value.report_type &&
    (reportForm.value.sample_id ||
      reportForm.value.location_ids.length > 0 ||
      (reportForm.value.start_date && reportForm.value.end_date))
  );
});

const canGenerate = computed(() => {
  return reportForm.value.report_type && reportForm.value.title;
});

onMounted(() => {
  loadInitialData();
});

const loadInitialData = async () => {
  await Promise.all([
    loadReports(),
    loadTemplates(),
    locationsStore.fetchLocations(),
    loadRecentSamples(),
  ]);
};

const loadReports = async () => {
  loading.value = true;
  try {
    const response = await reportsService.getAll(filters.value);
    reports.value = response.data;
  } finally {
    loading.value = false;
  }
};

const loadTemplates = async () => {
  try {
    const response = await reportsService.getTemplates();
    templates.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const loadRecentSamples = async () => {
  try {
    const response = await samplesService.getAll({ per_page: 100 });
    recentSamples.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const selectTemplate = (template) => {
  selectedTemplate.value = template;
  reportForm.value.report_type = template.type;
  reportForm.value.title = `${template.name} - ${formatDate(new Date())}`;
  showGenerateDialog.value = true;
};

const previewReport = async () => {
  try {
    const response = await reportsService.preview(reportForm.value);
    preview.value = response.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

const generateReport = async () => {
  generating.value = true;
  try {
    const response = await reportsService.generate(reportForm.value);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Report generated successfully!",
      life: 3000,
    });

    closeGenerateDialog();

    // Wait a moment then show the PDF
    setTimeout(() => {
      currentReport.value = response.data;
      showPDFDialog.value = true;
    }, 500);

    loadReports();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  } finally {
    generating.value = false;
  }
};

const viewReport = async (report) => {
  try {
    // Fetch full report data
    const response = await reportsService.getById(report.id);
    currentReport.value = response.data;
    showPDFDialog.value = true;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load report",
      life: 3000,
    });
  }
};

const confirmDelete = (report) => {
  confirm.require({
    message: `Delete report "${report.title}"?`,
    header: "Confirm Deletion",
    icon: "pi pi-exclamation-triangle",
    accept: () => deleteReport(report.id),
  });
};

const deleteReport = async (id) => {
  try {
    await reportsService.delete(id);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Report deleted",
      life: 3000,
    });
    loadReports();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

const closeGenerateDialog = () => {
  showGenerateDialog.value = false;
  selectedTemplate.value = null;
  preview.value = null;
  reportForm.value = {
    report_type: null,
    title: "",
    description: "",
    start_date: null,
    end_date: null,
    location_ids: [],
    sample_id: null,
    include_charts: true,
    include_recommendations: true,
  };
};

const getTemplateIcon = (type) => {
  const icons = {
    single_sample: "pi pi-file",
    location_trend: "pi pi-chart-line",
    comparative: "pi pi-clone",
    regional: "pi pi-map",
    custom: "pi pi-cog",
  };
  return icons[type] || "pi pi-file";
};

const formatReportType = (type) => {
  return type
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
</script>
