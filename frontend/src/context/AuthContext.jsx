import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar token al cargar la app
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axiosInstance.get('/api/usuarios/usuarios/perfil/')
          setUser(response.data)
          setError(null)
        } catch (err) {
          console.error('Token verification failed:', err)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    verifyToken()
  }, [token])

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.post('/api/usuarios/auth/login/', {
        username,
        password
      })
      
const { token, user_id, email, username: user_username, first_name, last_name } = response.data
const userData = {
  id: user_id,
  username: user_username,
  email,
  first_name,
  last_name
}
localStorage.setItem('token', token)
setToken(token)
setUser(userData)
      
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.detail || 'Error al iniciar sesión'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.post('/api/usuarios/register/', userData)
      const { access, user: newUser } = response.data
      localStorage.setItem('token', access)
      setToken(access)
      setUser(newUser)
      
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.detail || 'Error en el registro'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
