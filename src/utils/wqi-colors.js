export const getWQIColor = (wqi) => {
  if (wqi >= 90) return '#22c55e' // Excellent - Green
  if (wqi >= 70) return '#3b82f6' // Good - Blue
  if (wqi >= 50) return '#eab308' // Fair - Yellow
  if (wqi >= 25) return '#f97316' // Poor - Orange
  return '#ef4444' // Very Poor - Red
}

export const getWQIStatus = (wqi) => {
  if (wqi >= 90) return 'Excellent'
  if (wqi >= 70) return 'Good'
  if (wqi >= 50) return 'Fair'
  if (wqi >= 25) return 'Poor'
  return 'Very Poor'
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