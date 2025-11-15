<template>
  <div>
    <!-- Report Preview/Download Dialog -->
    <Dialog
      v-model:visible="showReportDialog"
      :header="reportData?.title"
      :modal="true"
      :style="{ width: '95vw', maxWidth: '1200px' }"
      :maximizable="true"
    >
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <Button
          label="Download PDF"
          icon="pi pi-download"
          @click="downloadPDF"
          :loading="generating"
        />
        <Button
          label="Print"
          icon="pi pi-print"
          outlined
          @click="printReport"
        />
        <Button
          label="Download Excel"
          icon="pi pi-file-excel"
          outlined
          @click="downloadExcel"
        />
      </div>

      <!-- PDF Preview Container - Using only inline styles -->
      <div
        ref="reportContainer"
        style="
          background-color: #ffffff;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          margin-left: auto;
          margin-right: auto;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          font-family: Arial, sans-serif;
        "
      >
        <!-- Report Header -->
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1 style="font-size: 1.875rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">
                {{ reportData?.title }}
              </h1>
              <p style="color: #4b5563;">{{ reportData?.description }}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.875rem; color: #6b7280;">Report Code</div>
              <div style="font-family: monospace; font-weight: bold; color: #3b82f6;">
                {{ reportData?.report_code }}
              </div>
              <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">
                Generated: {{ formatDateTime(reportData?.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Report Type Badge -->
        <div style="margin-bottom: 1.5rem;">
          <span style="
            display: inline-block;
            background-color: #dbeafe;
            color: #1e40af;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
          ">
            {{ formatReportType(reportData?.report_type) }}
          </span>
        </div>

        <!-- Executive Summary -->
        <section v-if="reportData?.summary_statistics" style="margin-bottom: 2rem;">
          <h2 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
          ">
            Executive Summary
          </h2>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div
              v-for="(value, key) in getSummaryCards()"
              :key="key"
              style="
                background: linear-gradient(to bottom right, #eff6ff, #dbeafe);
                border-radius: 0.5rem;
                padding: 1rem;
                border: 1px solid #bfdbfe;
              "
            >
              <div style="font-size: 0.875rem; color: #4b5563; margin-bottom: 0.25rem;">
                {{ key }}
              </div>
              <div style="font-size: 1.5rem; font-weight: bold; color: #1f2937;">
                {{ value }}
              </div>
            </div>
          </div>

          <!-- Summary Table -->
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="
                  border: 1px solid #d1d5db;
                  padding: 0.5rem 1rem;
                  text-align: left;
                  font-weight: 600;
                ">
                  Metric
                </th>
                <th style="
                  border: 1px solid #d1d5db;
                  padding: 0.5rem 1rem;
                  text-align: left;
                  font-weight: 600;
                ">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(value, key) in reportData.summary_statistics"
                :key="key"
              >
                <td style="
                  border: 1px solid #d1d5db;
                  padding: 0.5rem 1rem;
                  font-weight: 500;
                ">
                  {{ formatKey(key) }}
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 1rem;">
                  {{ formatValue(value) }}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Trends Analysis -->
        <section
          v-if="reportData?.trends_analysis"
          style="margin-bottom: 2rem; page-break-before: always;"
        >
          <h2 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
          ">
            Trends Analysis
          </h2>

          <div style="
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin-bottom: 1rem;
          ">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <i
                :class="getTrendIcon(reportData.trends_analysis.direction)"
                style="font-size: 1.5rem;"
              ></i>
              <span style="font-weight: bold; font-size: 1.125rem;">
                {{ reportData.trends_analysis.direction?.toUpperCase() }}
              </span>
            </div>
            <p style="color: #374151; margin: 0.25rem 0;">
              Change Rate: {{ reportData.trends_analysis.change_rate }}
            </p>
            <p style="color: #4b5563; font-size: 0.875rem; margin: 0.25rem 0;">
              Slope: {{ reportData.trends_analysis.slope }}
            </p>
          </div>

          <!-- Trend Chart -->
          <div v-if="reportData.charts_data?.wqi_over_time" style="margin-top: 1.5rem;">
            <canvas ref="trendChart" style="width: 100%; height: 180px;"></canvas>
          </div>
        </section>

        <!-- Charts Section -->
        <section v-if="reportData?.charts_data" style="margin-bottom: 2rem; page-break-before: always;">
          <h2 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
          ">
            Visual Analysis
          </h2>

          <!-- WQI Comparison Chart -->
          <div v-if="reportData.charts_data.wqi_comparison" style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">
              WQI Standards Comparison
            </h3>
            <canvas ref="wqiChart" style="width: 100%; height: 160px;"></canvas>
          </div>

          <!-- Location Comparison Chart -->
          <div v-if="reportData.charts_data.location_comparison" style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">
              Location Comparison
            </h3>
            <canvas ref="locationChart" style="width: 100%; height: 180px;"></canvas>
          </div>

          <!-- Regional Chart -->
          <div v-if="reportData.charts_data.governorate_map" style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">
              Regional Distribution
            </h3>
            <canvas ref="regionalChart" style="width: 100%; height: 180px;"></canvas>
          </div>
        </section>

        <!-- Conclusions -->
        <section v-if="reportData?.conclusions" style="margin-bottom: 2rem;">
          <h2 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
          ">
            Conclusions
          </h2>
          <div style="
            background-color: #f9fafb;
            border-radius: 0.5rem;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
          ">
            <p style="color: #374151; line-height: 1.75; margin: 0;">
              {{ reportData.conclusions }}
            </p>
          </div>
        </section>

        <!-- Recommendations -->
        <section
          v-if="reportData?.recommendations && reportData.recommendations.length > 0"
          style="margin-bottom: 2rem;"
        >
          <h2 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
          ">
            Recommendations
          </h2>
          <div>
            <div
              v-for="(rec, idx) in reportData.recommendations"
              :key="idx"
              style="
                display: flex;
                gap: 0.75rem;
                align-items: flex-start;
                background-color: #fef3c7;
                border-left: 4px solid #eab308;
                padding: 1rem;
                border-radius: 0.25rem;
                margin-bottom: 0.75rem;
              "
            >
              <i class="pi pi-exclamation-triangle" style="color: #ca8a04; font-size: 1.25rem; margin-top: 0.125rem;"></i>
              <p style="color: #374151; flex: 1; margin: 0;">{{ rec }}</p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <div style="
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 2px solid #d1d5db;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        ">
          <p style="margin: 0.25rem 0;">Egyptian Water Quality Monitoring System</p>
          <p style="margin: 0.25rem 0;">
            This report was automatically generated on {{ formatDateTime(new Date()) }}
          </p>
          <p style="margin: 0.25rem 0;">For official use only - Confidential</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import Chart from "chart.js/auto";

const props = defineProps({
  visible: Boolean,
  reportData: Object,
});

const emit = defineEmits(["update:visible"]);

const showReportDialog = ref(false);
const reportContainer = ref(null);
const generating = ref(false);
const trendChart = ref(null);
const wqiChart = ref(null);
const locationChart = ref(null);
const regionalChart = ref(null);

let chartInstances = [];

watch(
  () => props.visible,
  (val) => {
    showReportDialog.value = val;
    if (val) {
      nextTick(() => {
        renderCharts();
      });
    }
  }
);

watch(showReportDialog, (val) => {
  emit("update:visible", val);
  if (!val) {
    destroyCharts();
  }
});

const renderCharts = () => {
  destroyCharts();

  const data = props.reportData?.charts_data;
  if (!data) return;

  // Trend Chart
  if (data.wqi_over_time && trendChart.value) {
    const ctx = trendChart.value.getContext("2d", { willReadFrequently: true });
    chartInstances.push(
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.wqi_over_time.dates,
          datasets: [
            {
              label: "WQI Over Time",
              data: data.wqi_over_time.wqi_values,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      })
    );
  }

  // WQI Comparison Chart
  if (data.wqi_comparison && wqiChart.value) {
    const ctx = wqiChart.value.getContext("2d", { willReadFrequently: true });
    chartInstances.push(
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.wqi_comparison.labels,
          datasets: [
            {
              label: "WQI Score",
              data: data.wqi_comparison.values,
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      })
    );
  }

  // Location Comparison Chart
  if (data.location_comparison && locationChart.value) {
    const ctx = locationChart.value.getContext("2d", { willReadFrequently: true });
    chartInstances.push(
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.location_comparison.locations,
          datasets: [
            {
              label: "Average WQI",
              data: data.location_comparison.avg_wqi,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      })
    );
  }

  // Regional Chart
  if (data.governorate_map && regionalChart.value) {
    const ctx = regionalChart.value.getContext("2d", { willReadFrequently: true });
    chartInstances.push(
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: data.governorate_map.governorates,
          datasets: [
            {
              label: "Average WQI",
              data: data.governorate_map.avg_wqi,
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(139, 92, 246, 0.8)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right" },
          },
        },
      })
    );
  }
};

const destroyCharts = () => {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances = [];
};

const downloadPDF = async () => {
  generating.value = true;

  try {
    const element = reportContainer.value;

    const options = {
      margin: [10, 10, 10, 10],
      filename: `${props.reportData.report_code}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(options).from(element).save();
    
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Failed to generate PDF: " + error.message);
  } finally {
    generating.value = false;
  }
};

const printReport = () => {
  window.print();
};

const downloadExcel = () => {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  if (props.reportData.summary_statistics) {
    const summaryData = Object.entries(props.reportData.summary_statistics).map(
      ([key, value]) => ({
        Metric: formatKey(key),
        Value: formatValue(value),
      })
    );
    const ws = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
  }

  // Trends Sheet
  if (props.reportData.trends_analysis) {
    const trendsData = Object.entries(props.reportData.trends_analysis).map(
      ([key, value]) => ({
        Metric: formatKey(key),
        Value: value,
      })
    );
    const ws = XLSX.utils.json_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(wb, ws, "Trends");
  }

  // Chart Data Sheet
  if (props.reportData.charts_data?.wqi_over_time) {
    const chartData = props.reportData.charts_data.wqi_over_time.dates.map(
      (date, idx) => ({
        Date: date,
        WQI: props.reportData.charts_data.wqi_over_time.wqi_values[idx],
      })
    );
    const ws = XLSX.utils.json_to_sheet(chartData);
    XLSX.utils.book_append_sheet(wb, ws, "WQI Data");
  }

  XLSX.writeFile(wb, `${props.reportData.report_code}.xlsx`);
};

const getSummaryCards = () => {
  const stats = props.reportData?.summary_statistics;
  if (!stats) return {};

  const cards = {};

  if (stats.total_samples) cards["Total Samples"] = stats.total_samples;
  if (stats.locations_count) cards["Locations"] = stats.locations_count;
  if (stats.avg_wqi) cards["Average WQI"] = stats.avg_wqi;
  if (stats.quality_status) cards["Quality Status"] = stats.quality_status;

  return cards;
};

const formatKey = (key) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (value) => {
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return value;
};

const formatReportType = (type) => {
  return type
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-GB");
};

const getTrendIcon = (direction) => {
  const icons = {
    improving: "pi pi-arrow-up",
    declining: "pi pi-arrow-down",
    stable: "pi pi-minus",
  };
  return icons[direction] || "pi pi-minus";
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  [ref="reportContainer"],
  [ref="reportContainer"] * {
    visibility: visible;
  }
  [ref="reportContainer"] {
    position: absolute;
    left: 0;
    top: 0;
  }
}

.page-break-before {
  page-break-before: always;
}

@page {
  size: A4;
  margin: 20mm;
}
</style>