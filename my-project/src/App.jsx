import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Home from './pages/Home'
import Stocks from './pages/Stocks'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stocks" element={<Stocks />} />
      </Routes>
    </Router>
  )
}

export default App
