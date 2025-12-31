// Stock helper utilities

// Calculate gain/loss for a stock
export const calculateGainLoss = (currentPrice, buyPrice) => {
  const gainLoss = currentPrice - buyPrice
  const gainLossPercent = ((gainLoss / buyPrice) * 100).toFixed(2)
  
  return {
    gainLoss,
    gainLossPercent
  }
}

// Validate stock input
export const validateStockInput = (ticker, buyPrice, buyDate) => {
  if (!ticker.trim()) {
    return { isValid: false, error: 'Please enter a stock symbol' }
  }

  if (!buyPrice.trim() || isNaN(parseFloat(buyPrice)) || parseFloat(buyPrice) <= 0) {
    return { isValid: false, error: 'Please enter a valid buy price' }
  }

  if (!buyDate.trim()) {
    return { isValid: false, error: 'Please enter a buy date' }
  }

  return { isValid: true }
}


// Check if stock already exists in portfolio
export const stockAlreadyExists = (stocks, ticker) => {
  return stocks.find(stock => stock.symbol === ticker.toUpperCase())
}

