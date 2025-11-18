import api from "./api";

export const samplesService = {
  getAll: (params) => api.get("/samples", { params }),
  getById: (id) => api.get(`/samples/${id}`),
  create: (data) => api.post("/samples", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  
  // FIX: Use POST with _method=PUT for FormData updates
  update: (id, data) => {
    // If data is FormData and doesn't have _method, add it
    if (data instanceof FormData && !data.has('_method')) {
      data.append('_method', 'PUT');
    }
    
    // Use POST endpoint with _method=PUT for file uploads
    return api.post(`/samples/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  
  delete: (id) => api.delete(`/samples/${id}`),
  verify: (id) => api.post(`/samples/${id}/verify`),
  getMapData: (params) => api.get("/samples/map-data", { params }),

  import: (file, locationId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("location_id", locationId);
    return api.post("/samples/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  bulkDelete: (ids) =>
    api.delete("/samples/bulk", {
      data: { ids },
    }),

  bulkUpdate: (ids, data) =>
    api.put("/samples/bulk", {
      ids,
      data,
    }),

  async export(filters = {}) {
    const response = await api.get("/samples/export", {
      params: filters,
      responseType: "blob", 
    });

    console.log(response);
    
    return response; 
  },

  getStatistics: (params) => api.get("/samples/statistics", { params }),
};