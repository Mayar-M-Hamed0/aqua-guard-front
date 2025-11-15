// src/services/reports.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const reportsService = {
  /**
   * Get all reports with filters
   */
  async getAll(filters = {}) {
    const response = await axios.get(`${API_URL}/reports`, { params: filters });
    return response.data;
  },

  /**
   * Get single report by ID
   */
  async getById(id) {
    const response = await axios.get(`${API_URL}/reports/${id}`);
    return response.data;
  },

  /**
   * Generate new report
   */
  async generate(data) {
    const response = await axios.post(`${API_URL}/reports/generate`, data);
    return response.data;
  },

  /**
   * Get report templates
   */
  async getTemplates() {
    const response = await axios.get(`${API_URL}/reports/templates`);
    return response.data;
  },

  /**
   * Preview report data
   */
  async preview(data) {
    const response = await axios.post(`${API_URL}/reports/preview`, data);
    return response.data;
  },

  /**
   * Download report file
   */
  async download(id, format = 'pdf') {
    const response = await axios.get(`${API_URL}/reports/${id}/download`, {
      params: { format },
    });
    return response.data;
  },

  /**
   * Delete report
   */
  async delete(id) {
    const response = await axios.delete(`${API_URL}/reports/${id}`);
    return response.data;
  },

  /**
   * Get report statistics
   */
  async getStatistics() {
    const response = await axios.get(`${API_URL}/reports/statistics`);
    return response.data;
  },
};