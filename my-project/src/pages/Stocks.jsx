import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase_client'
import { getStockData } from '../services/stockApi'
import { loadUserStocks, removeStockFromDatabase, ensureUserStocksTable, testRLSPolicies } from '../services/stockDatabase'
import { calculateGainLoss } from '../utils/stockHelpers'
import StockHeader from '../components/stocks/StockHeader'
import AddStockForm from '../components/stocks/AddStockForm'
import StockTable from '../components/stocks/StockTable.jsx'
import StockChart from '../components/stocks/StockChart'
import './Stocks.css'

const Stocks = () => {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      try {
        // First check the session
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session) {
          setUser(sessionData.session.user)
          await loadStocks(sessionData.session.user.id)
          return
        }
        
        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data?.user) {
          navigate('/')
        } else {
          setUser(data.user)
          await loadStocks(data.user.id)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        navigate('/')
      }
    }
    checkUser()
  }, [navigate])

  // Load user's stocks
  const loadStocks = async (userId) => {
    try {
      setLoading(true)
      
      // First check if the table exists
      const tableCheck = await ensureUserStocksTable()
      if (!tableCheck.exists) {
        setError(`Database Setup Required: ${tableCheck.error}`)
        setLoading(false)
        return
      }

      // Test RLS policies
      const rlsCheck = await testRLSPolicies()
      if (!rlsCheck.canAccess) {
        setError(`Row Level Security Setup Required: ${rlsCheck.error}`)
        setLoading(false)
        return
      }
      
      const userStocks = await loadUserStocks(userId)
      setStocks(userStocks)
    } catch (err) {
      console.error('Error loading user stocks:', err)
      setError('Failed to load your stocks: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new stock to the list
  const handleStockAdded = (newStock) => {
    setStocks([newStock, ...stocks])
  }

  // Remove stock from the list
  const handleRemoveStock = async (stockId) => {
    try {
      await removeStockFromDatabase(stockId)
      setStocks(stocks.filter(stock => stock.id !== stockId))
    } catch (err) {
      console.error('Error removing stock:', err)
      setError('Failed to remove stock')
    }
  }

  // Refresh current prices for all stocks
  const handleRefreshPrices = async () => {
    if (!user || stocks.length === 0) return

    setLoading(true)
    setError('')
    
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const stockData = await getStockData(stock.symbol)
          
          if (stockData.success) {
            const currentPrice = stockData.price
            const { gainLoss, gainLossPercent } = calculateGainLoss(currentPrice, stock.buyPrice)

            return {
              ...stock,
              currentPrice: currentPrice,
              gainLoss: gainLoss,
              gainLossPercent: gainLossPercent
            }
          }
          return stock // Return unchanged if API fails
        })
      )
      
      setStocks(updatedStocks)
    } catch (err) {
      console.error('Error refreshing prices:', err)
      setError('Failed to refresh prices')
    } finally {
      setLoading(false)
    }
  }

  // Handle errors from child components
  const handleError = (errorMessage) => {
    setError(errorMessage)
  }

  // Handle showing stock chart
  const handleShowChart = (ticker) => {
    setSelectedTicker(ticker)
    setShowChart(true)
  }

  // Handle closing stock chart
  const handleCloseChart = () => {
    setShowChart(false)
    setSelectedTicker('')
  }

  return (
    <div className="stocks-page">
      <StockHeader 
        onRefreshPrices={handleRefreshPrices}
        loading={loading}
        hasStocks={stocks.length > 0}
      />

      <AddStockForm 
        user={user}
        stocks={stocks}
        onStockAdded={handleStockAdded}
        onError={handleError}
      />

      {error && <p className="error-message">{error}</p>}

      <div className="stocks-table-container">
        <StockTable 
          stocks={stocks}
          onRemoveStock={handleRemoveStock}
          onShowChart={handleShowChart}
        />
      </div>

      {showChart && (
        <StockChart 
          ticker={selectedTicker}
          onClose={handleCloseChart}
        />
      )}
    </div>
  )
}

export default Stocks