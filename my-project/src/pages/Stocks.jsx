/**
 * Example React Page Component
 * 
 * This shows how to:
 * 1. Call your FastAPI backend from React
 * 2. Handle loading states
 * 3. Display data from the backend
 * 
 * Flow: Stocks.jsx → api.js → FastAPI → Database
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase_client'
import { getItems, createItem, updateItem, deleteItem } from '../services/api'
import './Stocks.css'

const Stocks = () => {
  const navigate = useNavigate()
  
  // State management
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  // Check authentication on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data?.user) {
          navigate('/')
        } else {
          setUser(data.user)
          // Load data once user is authenticated
          await loadItems()
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        navigate('/')
      }
    }
    checkUser()
  }, [navigate])

  // ============================================
  // EXAMPLE: Load data from backend
  // ============================================
  const loadItems = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Call your FastAPI backend via api.js
      const data = await getItems()
      setItems(data)
    } catch (err) {
      console.error('Error loading items:', err)
      setError('Failed to load items: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // EXAMPLE: Create new item
  // ============================================
  const handleCreateItem = async (itemData) => {
    try {
      setLoading(true)
      setError('')
      
      // Call your FastAPI backend
      const newItem = await createItem(itemData)
      
      // Update local state
      setItems([newItem, ...items])
    } catch (err) {
      console.error('Error creating item:', err)
      setError('Failed to create item: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // EXAMPLE: Update item
  // ============================================
  const handleUpdateItem = async (itemId, itemData) => {
    try {
      setLoading(true)
      setError('')
      
      // Call your FastAPI backend
      const updatedItem = await updateItem(itemId, itemData)
      
      // Update local state
      setItems(items.map(item => 
        item.id === itemId ? updatedItem : item
      ))
    } catch (err) {
      console.error('Error updating item:', err)
      setError('Failed to update item: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // EXAMPLE: Delete item
  // ============================================
  const handleDeleteItem = async (itemId) => {
    try {
      setLoading(true)
      setError('')
      
      // Call your FastAPI backend
      await deleteItem(itemId)
      
      // Update local state
      setItems(items.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Failed to delete item: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // RENDER UI
  // ============================================
  if (loading && items.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="stocks-page">
      <h1>Your Items</h1>
      
      {error && <p className="error-message">{error}</p>}
      
      {/* Display items from backend */}
      <div>
        {items.map(item => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
      
      {/* Example: Add new item form */}
      <div>
        <h2>Add New Item</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          handleCreateItem({
            name: formData.get('name'),
            description: formData.get('description')
          })
        }}>
          <input name="name" placeholder="Item name" required />
          <input name="description" placeholder="Description" />
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  )
}

export default Stocks
