import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase_client'

export default function Signup({ onClose }) {
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
        setMessage('')

        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
        })

        if (error) {
            setMessage(error.message)
            console.error('Error signing up:', error)
        } else {
            setMessage('Signup successful! Please check your email for verification.')
            setEmail('')
            setPassword('')
            console.log('Signup successful:', data)
            // Don't auto-navigate on signup as user needs to verify email first
            navigate('/home', { replace: true })
            onClose && onClose()
        }
    }

    return (
        <div className="overlay">
            <div className="auth-popup">
                <h1>Signup</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={email} required onChange={handleEmailChange} />
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={password} required onChange={handlePasswordChange} />
                    <input type="submit" value="Signup" className="submit-button" />
                </form>
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    )
}
