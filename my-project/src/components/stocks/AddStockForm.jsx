import { useState } from 'react'
import { getStockData, getHistoricalStockData, getCompanyName, saveStockToDatabase } from '../../services/api'
import { validateStockInput, stockAlreadyExists, calculateGainLoss } from '../../utils/stockHelpers'

const AddStockForm = ({ user, stocks, onStockAdded, onError }) => {
  const [newStock, setNewStock] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [buyDate, setBuyDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addStock()
    }
  }

  const addStock = async () => {
    if (!user) {
      onError('User not authenticated')
      return
    }

    const stockSymbol = newStock.toUpperCase().trim()
    const userBuyPrice = parseFloat(buyPrice)

    // Validate input
    const validation = validateStockInput(newStock, buyPrice, buyDate)
    if (!validation.isValid) {
      onError(validation.error)
      return
    }

    // Check if stock already exists
    if (stockAlreadyExists(stocks, stockSymbol)) {
      onError('Stock already in your list')
      return
    }

    setLoading(true)
    onError('') // Clear any previous errors

    try {
      // Get real stock data from API
      const stockData = await getStockData(stockSymbol)
      
      if (!stockData.success) {
        onError(`Failed to fetch data: ${stockData.error}`)
        setLoading(false)
        return
      }

      const companyName = getCompanyName(stockSymbol)

      // Save to Supabase
      const savedStock = await saveStockToDatabase(
        user.id,
        stockSymbol,
        companyName,
        userBuyPrice,
        buyDate
      )

      // Check if buy date was on weekend
      const purchaseDate = new Date(buyDate)
      const dayOfWeek = purchaseDate.getDay()
      const isWeekendPurchase = dayOfWeek === 0 || dayOfWeek === 6
      
      let effectiveCurrentPrice = stockData.price
      
      // If purchased on weekend, get Friday's price
      if (isWeekendPurchase) {
        const historicalData = await getHistoricalStockData(stockSymbol, buyDate)
        if (historicalData.success) {
          effectiveCurrentPrice = historicalData.price
        }
      }
      
      const { gainLoss, gainLossPercent } = calculateGainLoss(effectiveCurrentPrice, userBuyPrice)


      const newStockEntry = {
        id: savedStock.id,
        symbol: stockSymbol,
        name: companyName,
        currentPrice: effectiveCurrentPrice,
        buyPrice: userBuyPrice,
        buyDate: buyDate,
        gainLoss: gainLoss,
        gainLossPercent: gainLossPercent,
        addedAt: new Date().toLocaleDateString(),
        isWeekendBuy: isWeekendPurchase
      }

      // Clear form
      setNewStock('')
      setBuyPrice('')
      setBuyDate('')

      // Notify parent component
      onStockAdded(newStockEntry)

    } catch (err) {
      console.error('Error adding stock:', err)
      
      // Show detailed error message
      let errorMessage = 'Failed to add stock: ' + err.message
      
      
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-stock-section">
      <div className="add-stock-form">
        <input
          type="text"
          placeholder="Stock symbol (e.g., AAPL)"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          onKeyPress={handleKeyPress}
          className="stock-input"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Buy price ($)"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          onKeyPress={handleKeyPress}
          className="stock-input price-input"
        />
        <input
          type="date"
          value={buyDate}
          onChange={(e) => setBuyDate(e.target.value)}
          className="stock-input date-input"
        />
        <button 
          onClick={addStock} 
          disabled={loading}
          className="add-button"
        >
          {loading ? 'Adding...' : 'Add Stock'}
        </button>
      </div>
    </div>
  )
}

export default AddStockForm
