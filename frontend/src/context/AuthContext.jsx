import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosConfig'

// Creación del contexto de autenticación para compartir el estado del usuario en toda la app
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null) // Almacena los datos del usuario logueado
  const [token, setToken] = useState(localStorage.getItem('token')) // Token de sesión
  const [loading, setLoading] = useState(true) // Estado de carga inicial
  const [error, setError] = useState(null) // Errores de autenticación

  // Efecto que se ejecuta al montar la aplicación para verificar si hay una sesión válida
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Intenta obtener el perfil del usuario usando el token almacenado
          const response = await axiosInstance.get('/api/usuarios/usuarios/perfil/')
          setUser(response.data)
          setError(null)
        } catch (err) {
          console.error('Token verification failed:', err)
          // Si falla, limpia la sesión local
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    verifyToken()
  }, [token])

  // Función para iniciar sesión
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
      // Guarda el token en localStorage para persistencia
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

  // Función para cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  // Función para registrar un nuevo usuario/trabajador
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

  // Valores expuestos por el contexto
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!token && !!user // Helper para saber si está logueado
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto de autenticación fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
