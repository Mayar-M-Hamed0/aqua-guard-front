export const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A'
  return Number(num).toFixed(decimals)
}

export const formatPercentage = (num) => {
  if (num === null || num === undefined) return 'N/A'
  return `${Number(num).toFixed(1)}%`
}