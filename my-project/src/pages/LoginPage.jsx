import { useState, useEffect } from 'react'
import wiseAssistLogo from '../images/wize_assist_logo2.png'
import './login.css'
import Login from '../components/auth/login'
import Signup from '../components/auth/signup'
import '../index.css'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase_client'

const LoginPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Error checking user:', error)
        }

        if (!error && data?.session) {
          console.log('User authenticated, redirecting to home')
          navigate('/home', { replace: true })
        } else {
          console.log('No authenticated user, staying on login page')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      }
    }
    checkUser()
  }, [navigate])

  return (
    <>
      <div className="website-name">
        <h1>Wise Assist</h1>
        <img src={wiseAssistLogo} className="logo" alt="Wise Assist Logo" />
      </div>

      <div className="auth-buttons">
        <button className="signup-button" onClick={() => setIsSignupOpen(true)}>
          Sign Up
        </button>
        {isSignupOpen && <Signup onClose={() => setIsSignupOpen(false)} />}

        <button className="login-button" onClick={() => setIsLoginOpen(true)}>
          Log In
        </button>
        {isLoginOpen && <Login onClose={() => setIsLoginOpen(false)} />}
      </div>
    </>
  )
}

export default LoginPage