export const getWQIColor = (wqi) => {
  if (wqi <= 25) return '#22c55e' // Excellent - Green
  if (wqi <= 50) return '#3b82f6' // Good - Blue
  if (wqi <= 75) return '#eab308' // Poor - Yellow
  if (wqi <= 100) return '#f97316' // Very Poor - Orange
  return '#ef4444'                // Unsuitable - Red
}

export const getWQIStatus = (wqi) => {
  if (wqi <= 25) return 'Excellent'
  if (wqi <= 50) return 'Good'
  if (wqi <= 75) return 'Poor'
  if (wqi <= 100) return 'Very Poor'
  return 'Unsuitable'
}

export const getRiskLevelColor = (riskLevel) => {
  const colors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  }
  return colors[riskLevel] || '#6b7280'
}

export const getRiskLevelIcon = (riskLevel) => {
  const icons = {
    low: 'pi pi-check-circle',
    medium: 'pi pi-exclamation-triangle',
    high: 'pi pi-exclamation-circle',
    critical: 'pi pi-times-circle',
  }
  return icons[riskLevel] || 'pi pi-info-circle'
}