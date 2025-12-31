import { useState, useEffect, useRef } from 'react'
import { getStockChartData, getCompanyName } from '../../services/api'

const StockChart = ({ ticker, onClose }) => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  const loadChartData = async (days) => {
    setLoading(true)
    setError('')
    setChartData(null)
    
    try {
      const result = await getStockChartData(ticker, days)
      
      if (result.success) {
        setChartData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load chart data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const createChart = (data) => {
    if (!chartRef.current) {
      return
    }

    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }

    try {
      const ctx = chartRef.current.getContext('2d')
      
      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => item.date.toLocaleDateString()),
          datasets: [{
            label: `${ticker} Close Price`,
            data: data.map(item => item.close),
            borderColor: '#94D2BD',
            backgroundColor: 'rgba(148, 210, 189, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `${getCompanyName(ticker)} (${ticker}) - ${selectedPeriod} Days`,
              color: '#E9D8A6',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              labels: {
                color: '#E9D8A6'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94D2BD',
                maxTicksLimit: 8
              },
              grid: {
                color: 'rgba(148, 210, 189, 0.2)'
              }
            },
            y: {
              ticks: {
                color: '#94D2BD',
                callback: function(value) {
                  return '$' + value.toFixed(2)
                }
              },
              grid: {
                color: 'rgba(148, 210, 189, 0.2)'
              }
            }
          }
        }
      })
    } catch (error) {
      setError('Failed to create chart: ' + error.message)
    }
  }

  useEffect(() => {
    loadChartData(selectedPeriod)
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [ticker, selectedPeriod])

  useEffect(() => {
    if (chartData && !loading && !error && chartRef.current) {
      const timeoutId = setTimeout(() => {
        createChart(chartData)
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [chartData, loading, error, selectedPeriod])

  const handlePeriodChange = (e) => {
    const newPeriod = parseInt(e.target.value)
    setSelectedPeriod(newPeriod)
  }

  return (
    <div className="chart-overlay">
      <div className="chart-modal">
        <div className="chart-header">
          <h2>{getCompanyName(ticker)} ({ticker})</h2>
          <div className="chart-controls">
            <select 
              value={selectedPeriod} 
              onChange={handlePeriodChange}
              className="period-select"
              disabled={loading}
            >
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
            <button onClick={onClose} className="close-button">×</button>
          </div>
        </div>

        <div className="chart-content">
          {loading && <div className="chart-loading">Loading chart data...</div>}
          {error && (
          <div className="chart-error">
            <strong>Error:</strong> {error}
          </div>
        )}
          {!loading && !error && chartData && (
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
          {!loading && !error && !chartData && (
            <div className="chart-loading">No chart data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StockChart