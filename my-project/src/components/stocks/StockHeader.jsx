import { useNavigate } from 'react-router-dom'

const StockHeader = ({ onRefreshPrices, loading, hasStocks }) => {
  const navigate = useNavigate()

  return (
    <div className="stocks-header">
      <h1>My Stock Portfolio</h1>
      <div className="header-buttons">
        <button 
          className="refresh-button" 
          onClick={onRefreshPrices}
          disabled={loading || !hasStocks}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Prices'}
        </button>
        <button className="back-button" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default StockHeader
