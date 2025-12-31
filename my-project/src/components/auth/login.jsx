import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase_client'

export default function Login({ onClose }) {
    const navigate = useNavigate()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        })

        if (error) {
            setMessage(error.message)
            console.error('Error logging in:', error)
        } else {
            setMessage('Login successful!')
            setEmail('')
            setPassword('')
            console.log('Login successful:', data)
            navigate('/home', { replace: true })
            onClose && onClose()
        }
    }

    return (
        <div className="overlay">
            <div className="auth-popup">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={email} required onChange={handleEmailChange} />
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={password} required onChange={handlePasswordChange} />
                    <input type="submit" value="Login" className="submit-button" />
                    <p>{message}</p>
                </form>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    )
}
