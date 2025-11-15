export const getChartColors = () => ({
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
})

export const generateTimeSeriesData = (samples, parameter) => {
  return samples.map(sample => ({
    x: new Date(sample.collection_date),
    y: sample[parameter]
  }))
}

export const getWQIChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'WQI Score'
      }
    }
  }
})