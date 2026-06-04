import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const role  = localStorage.getItem('role')
    const nama  = localStorage.getItem('nama')
    const id    = localStorage.getItem('id')
    return token ? { token, role, nama, id: id ? parseInt(id) : null } : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    const { access_token, role, nama, id } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('role', role)
    localStorage.setItem('nama', nama)
    localStorage.setItem('id', id)
    setUser({ token: access_token, role, nama, id })
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
