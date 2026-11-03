import { createContext, useContext, useState, useEffect } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sa_token')
    const stored = localStorage.getItem('sa_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } })
    localStorage.setItem('sa_token', res.token)
    localStorage.setItem('sa_user', JSON.stringify(res.user))
    setUser(res.user)
    return res
  }

  function logout() {
    localStorage.removeItem('sa_token')
    localStorage.removeItem('sa_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
