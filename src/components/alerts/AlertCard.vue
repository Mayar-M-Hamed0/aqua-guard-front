<template>
  <div class="alert-card" :class="[`severity-${alert.severity}`, { 'unread': !alert.is_read, 'resolved': alert.is_resolved }]">
    <div class="alert-indicator" :class="`severity-${alert.severity}`"></div>

    <div class="alert-content">
      <div class="alert-header">
        <div class="alert-meta">
          <Tag :value="alert.severity" :severity="getSeveritySeverity()" :icon="getSeverityIcon()" />
          <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
          <Badge v-if="!alert.is_read" value="New" severity="info" />
          <Badge v-if="alert.is_resolved" value="Resolved" severity="success" icon="pi pi-check" />
        </div>
        
        <div class="alert-actions">
          <Button 
            v-if="!alert.is_read"
            icon="pi pi-check" 
            text 
            rounded
            size="small"
            @click="$emit('mark-read')"
            v-tooltip.top="'Mark as Read'"
          />
          <Button 
            v-if="!alert.is_resolved"
            icon="pi pi-check-circle" 
            text 
            rounded
            size="small"
            severity="success"
            @click="$emit('resolve')"
            v-tooltip.top="'Resolve'"
          />
          <Button 
            icon="pi pi-trash" 
            text 
            rounded
            size="small"
            severity="danger"
            @click="$emit('delete')"
            v-tooltip.top="'Delete'"
          />
        </div>
      </div>

      <div class="alert-body">
        <div class="alert-location">
          <i class="pi pi-map-marker"></i>
          <span @click="$emit('view-location')" class="location-link">{{ alert.location?.name }}</span>
        </div>

        <p class="alert-message">{{ alert.message }}</p>

        <div v-if="alert.parameter_name" class="alert-details">
          <div class="detail-item">
            <span class="detail-label">Parameter:</span>
            <Tag :value="formatParameter(alert.parameter_name)" />
          </div>
          <div v-if="alert.parameter_value" class="detail-item">
            <span class="detail-label">Value:</span>
            <span class="detail-value exceeded">{{ alert.parameter_value }}</span>
          </div>
          <div v-if="alert.threshold_value" class="detail-item">
            <span class="detail-label">Threshold:</span>
            <span class="detail-value">{{ alert.threshold_value }}</span>
          </div>
        </div>

        <div v-if="alert.sample" class="alert-sample">
          <Button 
            :label="`View Sample ${alert.sample.sample_code}`"
            icon="pi pi-external-link"
            text
            size="small"
            @click="$emit('view-sample')"
          />
        </div>

        <div v-if="alert.is_resolved && alert.resolution_notes" class="resolution-notes">
          <strong>Resolution:</strong> {{ alert.resolution_notes }}
          <small>Resolved by {{ alert.resolver?.name }} on {{ formatDate(alert.resolved_at) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatters'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
})

defineEmits(['mark-read', 'resolve', 'delete', 'view-sample', 'view-location'])

const formatTime = (date) => {
  return dayjs(date).fromNow()
}

const formatParameter = (param) => {
  const names = {
    fecal_coliform: 'Fecal Coliform',
    e_coli: 'E. Coli',
    ph: 'pH',
    tds: 'TDS',
    turbidity: 'Turbidity',
    nitrate: 'Nitrate',
    lead: 'Lead',
    dissolved_oxygen: 'Dissolved Oxygen'
  }
  return names[param] || param
}

const getSeveritySeverity = () => {
  return props.alert.severity === 'critical' || props.alert.severity === 'emergency' ? 'danger' : 
         props.alert.severity === 'warning' ? 'warning' : 'info'
}

const getSeverityIcon = () => {
  const icons = {
    critical: 'pi pi-times-circle',
    emergency: 'pi pi-ban',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle'
  }
  return icons[props.alert.severity] || 'pi pi-bell'
}
</script>

<style scoped>
.alert-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
  display: flex;
  gap: 1rem;
}

.alert-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateX(4px);
}

.alert-card.unread {
  border-color: #3b82f6;
  background: #eff6ff;
}

.alert-card.severity-critical {
  border-left: 4px solid #ef4444;
}

.alert-card.severity-emergency {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

.alert-card.severity-warning {
  border-left: 4px solid #f59e0b;
}

.alert-card.severity-info {
  border-left: 4px solid #3b82f6;
}

.alert-card.resolved {
  opacity: 0.7;
  border-color: #d1d5db;
}

.alert-indicator {
  width: 4px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 12px 0 0 12px;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.alert-time {
  color: #64748b;
  font-size: 0.875rem;
}

.alert-actions {
  display: flex;
  gap: 0.25rem;
}

.alert-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.location-link {
  color: #3b82f6;
  cursor: pointer;
  font-weight: 600;
}

.location-link:hover {
  text-decoration: underline;
}

.alert-message {
  font-size: 1rem;
  color: #1e293b;
  margin: 0;
  line-height: 1.6;
}

.alert-details {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-weight: 700;
  color: #1e293b;
}

.detail-value.exceeded {
  color: #ef4444;
}

.alert-sample {
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.resolution-notes {
  padding: 1rem;
  background: #dcfce7;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #166534;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resolution-notes small {
  color: #15803d;
  font-style: italic;
}
</style>