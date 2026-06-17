import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './services/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'

function App() {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/chat'
      }
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App