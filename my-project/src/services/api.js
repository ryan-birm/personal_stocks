/**
 * API Client - Frontend service that calls your Python FastAPI backend
 * 
 * Flow: React Component → api.js → FastAPI Backend → Database
 */
import { supabase } from './supabase_client'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Helper function to make authenticated API requests
 * This sends requests to your FastAPI backend
 */
async function request(endpoint, options = {}) {
  // Get user session from Supabase for authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  // Make request to FastAPI backend
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.id}`, // Send user ID to backend
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

// ============================================
// EXAMPLE API FUNCTIONS - Replace with your own
// ============================================

/**
 * Example: Get data from backend
 * This calls: GET /api/items
 */
export const getItems = async () => {
  const response = await request('/api/items')
  return response.data || []
}

/**
 * Example: Create new item
 * This calls: POST /api/items
 */
export const createItem = async (itemData) => {
  const response = await request('/api/items', {
    method: 'POST',
    body: itemData
  })
  return response.data
}

/**
 * Example: Update item
 * This calls: PUT /api/items/{id}
 */
export const updateItem = async (id, itemData) => {
  const response = await request(`/api/items/${id}`, {
    method: 'PUT',
    body: itemData
  })
  return response.data
}

/**
 * Example: Delete item
 * This calls: DELETE /api/items/{id}
 */
export const deleteItem = async (id) => {
  await request(`/api/items/${id}`, { method: 'DELETE' })
}
