<template>
  <div class="map-wrapper">
    <div id="water-quality-map" ref="mapContainer"></div>

    <!-- Map Legend -->
    <div class="map-legend">
      <h4 class="legend-title">Legend</h4>
      <div v-if="view === 'risk'" class="legend-items">
        <div class="legend-item">
          <div class="legend-marker" style="background: #22c55e"></div>
          <span>Low Risk</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #eab308"></div>
          <span>Medium Risk</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #f97316"></div>
          <span>High Risk</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #ef4444"></div>
          <span>Critical Risk</span>
        </div>
      </div>

      <div v-else-if="view === 'wqi'" class="legend-items">
        <div class="legend-item">
          <div class="legend-marker" style="background: #22c55e"></div>
          <span>Excellent (90-100)</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #3b82f6"></div>
          <span>Good (70-89)</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #eab308"></div>
          <span>Fair (50-69)</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #f97316"></div>
          <span>Poor (25-49)</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker" style="background: #ef4444"></div>
          <span>Very Poor (0-24)</span>
        </div>
      </div>
    </div>

    <!-- Heatmap Toggle -->
    <div class="map-controls">
      <Button
        :label="showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'"
        :icon="showHeatmap ? 'pi pi-eye-slash' : 'pi pi-eye'"
        @click="toggleHeatmap"
        size="small"
      />
      <Button
        label="Cluster View"
        icon="pi pi-sitemap"
        @click="toggleClustering"
        size="small"
        :outlined="!useClustering"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import 'leaflet.heat'
import "/node_modules/leaflet.markercluster";
import "/node_modules/leaflet.markercluster/dist/MarkerCluster.css";
import "/node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css";
import { getWQIColor, getRiskLevelColor } from "@/utils/wqi-colors";

const props = defineProps({
  locations: {
    type: Array,
    required: true,
  },
  view: {
    type: String,
    default: "risk", // 'risk', 'wqi', 'quality'
  },
});

const emit = defineEmits(["marker-click"]);

const mapContainer = ref(null);
const map = ref(null);
const markers = ref([]);
const heatmapLayer = ref(null);
const markerClusterGroup = ref(null);
const showHeatmap = ref(false);
const useClustering = ref(true);

// Default center (Egypt)
const defaultCenter = [26.8206, 30.8025];
const defaultZoom = 6;

onMounted(() => {
  initializeMap();
  
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup-button')) {
      const locationId = e.target.getAttribute('data-location-id');
      emit('marker-click', locationId);
    }
  });
});

watch(
  () => props.locations,
  () => {
    updateMarkers();
  },
  { deep: true }
);

watch(
  () => props.view,
  () => {
    updateMarkers();
  }
);

const initializeMap = () => {
  if (!mapContainer.value) return;

  // Initialize Leaflet map
  map.value = L.map(mapContainer.value).setView(defaultCenter, defaultZoom);

  // Add tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map.value);

  // Initialize marker cluster group
  markerClusterGroup.value = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function (cluster) {
      const markers = cluster.getAllChildMarkers();
      const criticalCount = markers.filter(
        (m) => m.options.risk === "critical"
      ).length;
      const highCount = markers.filter((m) => m.options.risk === "high").length;

      let clusterClass = "cluster-low";
      if (criticalCount > 0) clusterClass = "cluster-critical";
      else if (highCount > 0) clusterClass = "cluster-high";
      else if (markers.some((m) => m.options.risk === "medium"))
        clusterClass = "cluster-medium";

      return L.divIcon({
        html: `<div class="cluster-icon ${clusterClass}"><span>${cluster.getChildCount()}</span></div>`,
        className: "custom-cluster",
        iconSize: L.point(40, 40),
      });
    },
  });

  if (useClustering.value) {
    map.value.addLayer(markerClusterGroup.value);
  }

  // Add markers
  nextTick(() => {
    updateMarkers();
  });
};

const updateMarkers = () => {
  if (!map.value || !props.locations) return;

  // Clear existing markers
  clearMarkers();

  // Add new markers
  props.locations.forEach((location) => {
    const marker = createMarker(location);
    markers.value.push(marker);

    if (useClustering.value) {
      markerClusterGroup.value.addLayer(marker);
    } else {
      marker.addTo(map.value);
    }
  });

  // ✅ إصلاح: تحقق من وجود مواقع أولاً
  if (props.locations.length > 0) {
    const bounds = L.latLngBounds(
      props.locations.map((loc) => [loc.latitude, loc.longitude])
    );
    map.value.fitBounds(bounds);
  }

  // Update heatmap if enabled
  if (showHeatmap.value) {
    updateHeatmap();
  }
};

const createMarker = (location) => {
  if (!location.latitude || !location.longitude) {
    console.warn('Invalid location coordinates:', location);
    return null;
  }

  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);
  
  // ✅ تحقق من صحة الأرقام
  if (isNaN(lat) || isNaN(lng)) {
    console.warn('Invalid coordinates format:', location);
    return null;
  }

  // Get marker color based on view
  let color;
  if (props.view === "risk") {
    color = getRiskLevelColor(location.risk_level);
  } else if (props.view === "wqi") {
    color = getWQIColor(location.latest_wqi);
  } else {
    color = getQualityColor(location.quality_status);
  }

  // Create custom icon
  const icon = L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-pin" style="background-color: ${color};">
        <div class="marker-pulse" style="background-color: ${color};"></div>
        ${
          location.risk_level === "critical"
            ? '<i class="pi pi-exclamation-triangle"></i>'
            : ""
        }
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const marker = L.marker([lat, lng], {
    icon,
    risk: location.risk_level,
  });

  // Create popup content
  const popupContent = `
    <div class="marker-popup">
      <h4>${location.name}</h4>
      <div class="popup-info">
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span class="info-value">${formatType(location.type)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">WQI:</span>
          <span class="info-value" style="color: ${getWQIColor(
            location.latest_wqi
          )}">
            ${location.latest_wqi || "N/A"}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value badge badge-${location.quality_status}">
            ${formatStatus(location.quality_status)}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Risk:</span>
          <span class="info-value badge badge-${location.risk_level}">
            ${formatStatus(location.risk_level)}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Last Sampled:</span>
          <span class="info-value">${formatDate(location.last_sampled)}</span>
        </div>
      </div>
      <button class="popup-button" onclick="window.viewLocation(${
        location.id
      })">
        View Details
      </button>
    </div>
  `;

  marker.bindPopup(popupContent, {
    maxWidth: 300,
    className: "custom-popup",
  });

  marker.on("click", () => {
    emit("marker-click", location.id);
  });

  return marker;
};

const clearMarkers = () => {
  markers.value.forEach((marker) => {
    if (useClustering.value) {
      markerClusterGroup.value.removeLayer(marker);
    } else {
      map.value.removeLayer(marker);
    }
  });
  markers.value = [];

  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
    heatmapLayer.value = null;
  }
};

const toggleHeatmap = () => {
  showHeatmap.value = !showHeatmap.value;

  if (showHeatmap.value) {
    updateHeatmap();
  } else if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
    heatmapLayer.value = null;
  }
};

const updateHeatmap = () => {
  if (!map.value || !props.locations) return;

  // Remove existing heatmap
  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
  }

  // Create heatmap data
  const heatmapData = props.locations.map((location) => {
    let intensity = 0.5;

    if (props.view === "risk") {
      const riskValues = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 };
      intensity = riskValues[location.risk_level] || 0.5;
    } else if (props.view === "wqi") {
      intensity = 1 - location.latest_wqi / 100; // Lower WQI = higher intensity
    }

    return [location.latitude, location.longitude, intensity];
  });

  // Add heatmap layer
  heatmapLayer.value = L.heatLayer(heatmapData, {
    radius: 25,
    blur: 15,
    maxZoom: 10,
    max: 1.0,
    gradient: {
      0.0: "#22c55e",
      0.3: "#eab308",
      0.6: "#f97316",
      1.0: "#ef4444",
    },
  }).addTo(map.value);
};

const toggleClustering = () => {
  useClustering.value = !useClustering.value;

  if (useClustering.value) {
    // Move markers to cluster group
    markers.value.forEach((marker) => {
      map.value.removeLayer(marker);
      markerClusterGroup.value.addLayer(marker);
    });
    map.value.addLayer(markerClusterGroup.value);
  } else {
    // Remove cluster group and add markers directly
    map.value.removeLayer(markerClusterGroup.value);
    markers.value.forEach((marker) => {
      markerClusterGroup.value.removeLayer(marker);
      marker.addTo(map.value);
    });
  }
};

const formatType = (type) => {
  return (
    type
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Unknown"
  );
};

const formatStatus = (status) => {
  return (
    status
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Unknown"
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getQualityColor = (status) => {
  const colors = {
    excellent: "#22c55e",
    good: "#3b82f6",
    fair: "#eab308",
    poor: "#f97316",
    very_poor: "#ef4444",
  };
  return colors[status] || "#6b7280";
};

// Expose viewLocation to window for popup button
const popupContent = `
  <div class="marker-popup">
    <h4>${location.name}</h4>
    <div class="popup-info">
      <!-- محتوى الـ popup -->
    </div>
    <button class="popup-button" data-location-id="${location.id}">
      View Details
    </button>
  </div>
`;
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px; /* ✅ إضافة حد أدنى للارتفاع */
}

#water-quality-map {
  width: 100%;
  height: 100%;
  min-height: 400px; /* ✅ إضافة حد أدنى */
  border-radius: 8px;
  z-index: 1;
}
.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.legend-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

/* Custom Marker Styles */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-pin) {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  background: #3b82f6;
  position: relative;
  transform: rotate(-45deg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.marker-pin i) {
  transform: rotate(45deg);
  color: white;
  font-size: 12px;
}

:deep(.marker-pulse) {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.4;
  animation: pulse 2s ease-out infinite;
  top: -5px;
  left: -5px;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Cluster Styles */
:deep(.custom-cluster) {
  background: transparent;
  border: none;
}

:deep(.cluster-icon) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:deep(.cluster-low) {
  background: #22c55e;
}
:deep(.cluster-medium) {
  background: #eab308;
}
:deep(.cluster-high) {
  background: #f97316;
}
:deep(.cluster-critical) {
  background: #ef4444;
}

/* Popup Styles */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  padding: 0;
}

:deep(.marker-popup) {
  padding: 1rem;
}

:deep(.marker-popup h4) {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #1e293b;
}

:deep(.popup-info) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

:deep(.info-row) {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

:deep(.info-label) {
  color: #64748b;
  font-weight: 500;
}

:deep(.info-value) {
  font-weight: 600;
  color: #1e293b;
}

:deep(.badge) {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

:deep(.badge-excellent) {
  background: #dcfce7;
  color: #166534;
}
:deep(.badge-good) {
  background: #dbeafe;
  color: #1e40af;
}
:deep(.badge-fair) {
  background: #fef9c3;
  color: #854d0e;
}
:deep(.badge-poor) {
  background: #fed7aa;
  color: #9a3412;
}
:deep(.badge-very_poor) {
  background: #fee2e2;
  color: #991b1b;
}
:deep(.badge-low) {
  background: #dcfce7;
  color: #166534;
}
:deep(.badge-medium) {
  background: #fef9c3;
  color: #854d0e;
}
:deep(.badge-high) {
  background: #fed7aa;
  color: #9a3412;
}
:deep(.badge-critical) {
  background: #fee2e2;
  color: #991b1b;
}

:deep(.popup-button) {
  width: 100%;
  padding: 0.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

:deep(.popup-button:hover) {
  background: #2563eb;
}
</style>
