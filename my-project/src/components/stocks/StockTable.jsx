import StockRow from './StockRow'

const StockTable = ({ stocks, onRemoveStock, onShowChart }) => {
  if (stocks.length === 0) {
    return (
      <div className="empty-state">
        <h3>No stocks in your portfolio yet</h3>
        <p>Add some stocks to get started!</p>
      </div>
    )
  }

  return (
    <table className="stocks-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Company Name</th>
          <th>Current Price</th>
          <th>Buy Price</th>
          <th>Buy Date</th>
          <th>Gain/Loss</th>
          <th>Gain/Loss %</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock) => (
          <StockRow 
            key={stock.id} 
            stock={stock} 
            onRemove={onRemoveStock}
            onShowChart={onShowChart}
          />
        ))}
      </tbody>
    </table>
  )
}

export default StockTable
