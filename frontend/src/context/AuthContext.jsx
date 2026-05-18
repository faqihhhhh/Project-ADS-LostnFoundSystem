import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role  = localStorage.getItem('role')
    const nama  = localStorage.getItem('nama')
    if (token) setUser({ token, role, nama })
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    const { access_token, role, nama } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('role', role)
    localStorage.setItem('nama', nama)
    setUser({ token: access_token, role, nama })
    return role
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
