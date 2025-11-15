<template>
  <div class="stat-card" :class="`stat-card-${color}`">
    <div class="stat-icon">
      <i :class="icon"></i>
    </div>
    
    <div class="stat-content">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <span v-if="trend" class="stat-trend" :class="trend.direction">
          <i :class="getTrendIcon()"></i>
          {{ trend.value }}%
        </span>
      </div>
      
      <div class="stat-value">{{ value }}</div>
      
      <div class="stat-footer">
        <span v-if="subtitle" class="stat-subtitle">{{ subtitle }}</span>
        <span v-if="status" class="stat-status" :class="`status-${status.toLowerCase()}`">
          {{ status }}
        </span>
        <span v-if="critical" class="stat-critical">
          <i class="pi pi-exclamation-triangle"></i>
          Requires Attention
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  },
  subtitle: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  trend: {
    type: Object,
    default: null
  },
  critical: {
    type: Boolean,
    default: false
  }
})

const getTrendIcon = () => {
  if (!props.trend) return ''
  return props.trend.direction === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'
}
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-color);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-card-blue { --card-color: #3b82f6; }
.stat-card-green { --card-color: #22c55e; }
.stat-card-purple { --card-color: #a855f7; }
.stat-card-red { --card-color: #ef4444; }
.stat-card-orange { --card-color: #f97316; }
.stat-card-teal { --card-color: #14b8a6; }
.stat-card-yellow { --card-color: #eab308; }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: var(--card-color);
  opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.stat-icon i {
  position: absolute;
  font-size: 1.75rem;
  color: var(--card-color);
  opacity: 1;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.stat-trend.up {
  color: #22c55e;
  background: #dcfce7;
}

.stat-trend.down {
  color: #ef4444;
  background: #fee2e2;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.stat-subtitle {
  color: #94a3b8;
}

.stat-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.status-excellent {
  background: #dcfce7;
  color: #166534;
}

.status-good {
  background: #dbeafe;
  color: #1e40af;
}

.status-fair {
  background: #fef9c3;
  color: #854d0e;
}

.status-poor {
  background: #fed7aa;
  color: #9a3412;
}

.stat-critical {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ef4444;
  font-weight: 600;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>