import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import wiseAssistLogo from '../images/wize_assist_logo2.png'
import './Home.css'
import '../index.css'
import { supabase } from '../services/supabase_client'


const Home = () => {
  const navigate = useNavigate()
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      
      if (error || !data?.user) {
        // User not authenticated, redirect to login
        navigate('/')
      }
    }
    checkUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const renderPageContent = () => {

    // HOME PAGE CONTENT
    return (
      <div className="content-card">
        <h2>Welcome to Wise Assist</h2>
        <p>
          You're logged in! Explore stock investing styles or jump straight to curated tech news.
        </p>

        <div className="expertise-entry">
          <p>Manage your personal stock portfolio?</p>
          <button
            type="button"
            className="explore-stocks-button"
            onClick={() => navigate('/stocks')}
          >
            My Stock Portfolio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-layout">
      <div className="website-name">
        <h1>Wise Assist</h1>
        <img src={wiseAssistLogo} className="logo" alt="Wise Assist Logo" />
      </div>

      <div className="auth-buttons">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {renderPageContent()}
    </div>
  )
}

export default Home