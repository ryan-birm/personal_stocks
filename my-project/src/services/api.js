/**
 * Simple API client - all backend calls in one place
 */
import { supabase } from './supabase_client'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Helper to make authenticated requests
async function request(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.id}`,
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || error.detail || 'Request failed')
  }

  return response.json()
}

// Stock API
export const getStockData = (ticker, options = {}) =>
  request('/api/stocks/data', {
    method: 'POST',
    body: { ticker, chart_days: options.chartDays || 30, historical_date: options.historicalDate }
  }).then(res => res.data || res)

export const getStockChartData = (ticker, days = 30) =>
  request(`/api/stocks/${ticker}/chart?days=${days}`).then(res => ({
    success: true,
    data: res.data?.chartData || res.data?.data || [],
    ticker: res.data?.ticker || ticker.toUpperCase(),
    period: `${days} days`
  }))

export const getHistoricalStockData = (ticker, date) =>
  request(`/api/stocks/${ticker}/historical?date=${date}`).then(res => ({
    price: res.data?.historicalPrice || res.data?.price,
    success: true
  }))

export const getCompanyName = (ticker) => {
  const names = {
    'AAPL': 'Apple Inc.', 'GOOGL': 'Alphabet Inc.', 'MSFT': 'Microsoft Corporation',
    'TSLA': 'Tesla Inc.', 'AMZN': 'Amazon.com Inc.', 'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.', 'NFLX': 'Netflix Inc.'
  }
  return names[ticker.toUpperCase()] || `${ticker.toUpperCase()} Corp.`
}

// Database API
export const loadUserStocks = () =>
  request('/api/user/stocks').then(res => res.data || [])

export const saveStockToDatabase = (userId, ticker, stockName, buyPrice, buyDate) =>
  request('/api/user/stocks', {
    method: 'POST',
    body: { ticker, stock_name: stockName, buy_price: buyPrice, buy_date: buyDate }
  }).then(res => res.data)

export const removeStockFromDatabase = (stockId) =>
  request(`/api/user/stocks/${stockId}`, { method: 'DELETE' })

// Database checks (still use Supabase directly)
export const testRLSPolicies = async () => {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { canAccess: false, error: 'No authenticated user' }
  
  const { error } = await supabase.from('stock_watcher').select('id').limit(1)
  if (error?.code === '42501') {
    return { canAccess: false, error: 'No SELECT policy exists' }
  }
  return { canAccess: true, error: null }
}

export const ensureUserStocksTable = async () => {
  const { error } = await supabase.from('stock_watcher').select('id').limit(1)
  if (error?.code === '42P01') return { exists: false, error: 'Table does not exist' }
  if (error) return { exists: false, error: error.message }
  return { exists: true, error: null }
}

