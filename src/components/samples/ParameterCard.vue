<template>
  <div class="parameter-card" :class="{ 'critical': critical, 'exceeded': isExceeded }">
    <div class="parameter-header">
      <div class="parameter-icon">
        <i :class="icon"></i>
      </div>
      <span class="parameter-label">{{ label }}</span>
    </div>

    <div class="parameter-value">
      <span class="value" :style="{ color: valueColor }">
        {{ formattedValue }}
      </span>
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>

    <div v-if="threshold" class="parameter-threshold">
      <span class="threshold-label">Threshold:</span>
      <span class="threshold-value">{{ formatThreshold }}</span>
    </div>

    <div v-if="isExceeded" class="parameter-warning">
      <i class="pi pi-exclamation-triangle"></i>
      <span>Exceeds safe limit</span>
    </div>

    <div v-if="status" class="parameter-status">
      <Tag :value="status" :severity="getStatusSeverity()" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: null
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'pi pi-circle'
  },
  threshold: {
    type: [Number, Object],
    default: null
  },
  critical: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: null
  }
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return 'N/A'
  if (typeof props.value === 'number') {
    return props.value.toFixed(2)
  }
  return props.value
})

const isExceeded = computed(() => {
  if (!props.threshold || props.value === null) return false
  
  if (typeof props.threshold === 'number') {
    return props.value > props.threshold
  }
  
  if (typeof props.threshold === 'object') {
    if (props.threshold.min && props.value < props.threshold.min) return true
    if (props.threshold.max && props.value > props.threshold.max) return true
  }
  
  return false
})

const valueColor = computed(() => {
  if (props.value === null) return '#94a3b8'
  if (isExceeded.value) return '#ef4444'
  return '#1e293b'
})

const formatThreshold = computed(() => {
  if (!props.threshold) return ''
  
  if (typeof props.threshold === 'number') {
    return `< ${props.threshold} ${props.unit}`
  }
  
  if (typeof props.threshold === 'object') {
    const parts = []
    if (props.threshold.min) parts.push(`Min: ${props.threshold.min}`)
    if (props.threshold.max) parts.push(`Max: ${props.threshold.max}`)
    return parts.join(', ') + (props.unit ? ` ${props.unit}` : '')
  }
  
  return ''
})

const getStatusSeverity = () => {
  if (!props.status) return 'info'
  
  const statusMap = {
    'acceptable': 'success',
    'warning': 'warning',
    'exceeded': 'danger',
    'critical': 'danger',
    'not_tested': 'secondary'
  }
  
  return statusMap[props.status] || 'info'
}
</script>

<style scoped>
.parameter-card {
  padding: 1.5rem;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s;
  position: relative;
}

.parameter-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.parameter-card.critical {
  border-color: #fecaca;
  background: #fef2f2;
}

.parameter-card.exceeded {
  border-color: #fbbf24;
  background: #fffbeb;
}

.parameter-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.parameter-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.25rem;
}

.parameter-card.critical .parameter-icon {
  background: #fee2e2;
  color: #ef4444;
}

.parameter-label {
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
}

.parameter-value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.unit {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.parameter-threshold {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.threshold-label {
  font-weight: 500;
}

.threshold-value {
  font-weight: 600;
}

.parameter-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.parameter-status {
  margin-top: 0.75rem;
}
</style>