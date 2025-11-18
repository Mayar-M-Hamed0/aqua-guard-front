import { defineStore } from "pinia";
import { samplesService } from "@/services/samples.service";

export const useSamplesStore = defineStore("samples", {
  state: () => ({
    samples: [],
    currentSample: null,
    pagination: null,
    loading: false,
  }),

  actions: {
    async fetchSamples(filters = {}) {
      this.loading = true;
      try {
        const response = await samplesService.getAll(filters);
        this.samples = response.data.data;
        this.pagination = response.data;
      } finally {
        this.loading = false;
      }
    },

    async fetchSampleById(id) {
      this.loading = true;
      try {
        const response = await samplesService.getById(id);
        this.currentSample = response.data;
      } finally {
        this.loading = false;
      }
    },

    async createSample(data) {
      const response = await samplesService.create(data);
      return response.data;
    },

    // ✅ أضف الـ update action
    async updateSample(id, data) {
      const response = await samplesService.update(id, data);

      // تحديث الـ sample في الـ array
      const index = this.samples.findIndex((sample) => sample.id === id);
      if (index !== -1) {
        this.samples[index] = response.data;
      }

      // تحديث currentSample إذا كان نفس الـ sample
      if (this.currentSample?.id === id) {
        this.currentSample = response.data;
      }

      return response.data;
    },

    // ✅ أضف الـ delete action
    async deleteSample(id) {
      await samplesService.delete(id);

      // حذف الـ sample من الـ array
      this.samples = this.samples.filter((sample) => sample.id !== id);

      // تحديث الـ pagination count
      if (this.pagination) {
        this.pagination.total = Math.max(0, this.pagination.total - 1);
      }
    },

    // ✅ أضف الـ verify action (مستخدم في الكود)
    async verifySample(id) {
      const response = await samplesService.verify(id);

      // تحديث status الـ sample
      const index = this.samples.findIndex((sample) => sample.id === id);
      if (index !== -1) {
        this.samples[index].status = "verified";
      }

      return response.data;
    },

    // ✅ أضف الـ bulk delete action (للحذف المتعدد)
    async deleteBulk(ids) {
      // حذف كل sample على حدة
      await Promise.all(ids.map((id) => samplesService.delete(id)));

      // حذف الـ samples من الـ array
      this.samples = this.samples.filter((sample) => !ids.includes(sample.id));

      // تحديث الـ pagination count
      if (this.pagination) {
        this.pagination.total = Math.max(0, this.pagination.total - ids.length);
      }
    },

    // ✅ أضف الـ import action (مستخدم في الكود)
    async importSamples(file, locationId) {
      const response = await samplesService.import(file, locationId);
      return response.data;
    },
    async exportSamples(filters = {}) {
      try {
        const response = await samplesService.export(filters);

        // ✅ استخدم response.data مباشرة (مش response.data.data)
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // باقي الكود زي ما هو...
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const date = new Date().toISOString().split("T")[0];
        link.download = `water-samples-${date}.xlsx`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
      } catch (error) {
        console.error("Export error details:", error.response || error);
        throw error;
      }
    },
  },
  // في ملف stores/samples.js
});
