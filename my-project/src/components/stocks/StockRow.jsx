const StockRow = ({ stock, onRemove, onShowChart, onFullInfo }) => {
  return (
    <tr>
      <td className="stock-symbol">
        <button 
          className="ticker-button" 
          onClick={() => onShowChart(stock.symbol)}
          title="Click to view chart"
        >
          {stock.symbol}
        </button>
      </td>
      <td className="company-name">{stock.name}</td>
      <td className="stock-price">${stock.currentPrice.toFixed(2)}</td>
      <td className="buy-price">${stock.buyPrice.toFixed(2)}</td>
      <td className="buy-date">{stock.buyDate}</td>
      <td className={`gain-loss ${stock.gainLoss >= 0 ? 'positive' : 'negative'}`}>
        ${stock.gainLoss.toFixed(2)}
      </td>
      <td className={`gain-loss-percent ${stock.gainLossPercent >= 0 ? 'positive' : 'negative'}`}>
        {stock.gainLossPercent >= 0 ? '+' : ''}{stock.gainLossPercent}%
      </td>
      <td>
        <button 
          onClick={() => onFullInfo(stock.symbol)}
          className="full-info-button"
        >
          Full Info
        </button>
      </td>
      <td>
        <button 
          onClick={() => onRemove(stock.id)}
          className="remove-button"
        >
          Remove
        </button>
      </td>
    </tr>
  )
}

export default StockRow