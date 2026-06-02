import axios from 'axios'

// Configuración centralizada de Axios para las peticiones HTTP
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // URL base del backend Django
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token de autenticación a cada petición saliente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      // Usa el esquema 'Token' requerido por TokenAuthentication de Django
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar globalmente errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el backend devuelve 401 (No autorizado), limpia el token y redirige al login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

// --- SERVICIOS DE API ORGANIZADOS POR MÓDULOS ---

// Servicios relacionados con usuarios y trabajadores
export const usuariosAPI = {
  login: (username, password) =>
    axiosInstance.post('/api/usuarios/auth/login/', { username, password }),
  
  register: (data) =>
    axiosInstance.post('/api/usuarios/register/', data),
  
  getPerfil: () =>
    axiosInstance.get('/api/usuarios/usuarios/perfil/'),
  
  getTrabajadores: (params = {}) =>
    axiosInstance.get('/api/usuarios/trabajadores/', { params }),
  
  getTrabajador: (id) =>
    axiosInstance.get(`/api/usuarios/trabajadores/${id}/`),
  
  createTrabajador: (data) =>
    axiosInstance.post('/api/usuarios/trabajadores/', data),
  
  updateTrabajador: (id, data) =>
    axiosInstance.put(`/api/usuarios/trabajadores/${id}/`, data),
  
  deleteTrabajador: (id) =>
    axiosInstance.delete(`/api/usuarios/trabajadores/${id}/`),
}

// Servicios para la gestión de órdenes de trabajo
export const ordenesAPI = {
  getOrdenes: (params = {}) =>
    axiosInstance.get('/api/produccion/ordenes/', { params }),
  
  getOrden: (id) =>
    axiosInstance.get(`/api/produccion/ordenes/${id}/`),
  
  createOrden: (data) =>
    axiosInstance.post('/api/produccion/ordenes/', data),
  
  updateOrden: (id, data) =>
    axiosInstance.put(`/api/produccion/ordenes/${id}/`, data),
  
  deleteOrden: (id) =>
    axiosInstance.delete(`/api/produccion/ordenes/${id}/`),
}

// Servicios para el control de tareas
export const tareasAPI = {
  getTareas: (params = {}) =>
    axiosInstance.get('/api/produccion/tareas/', { params }),
  
  getTarea: (id) =>
    axiosInstance.get(`/api/produccion/tareas/${id}/`),
  
  createTarea: (data) =>
    axiosInstance.post('/api/produccion/tareas/', data),
  
  updateTarea: (id, data) =>
    axiosInstance.put(`/api/produccion/tareas/${id}/`, data),
  
  deleteTarea: (id) =>
    axiosInstance.delete(`/api/produccion/tareas/${id}/`),
}

// Servicios para el registro de producción diaria
export const registrosAPI = {
  getRegistros: (params = {}) =>
    axiosInstance.get('/api/produccion/registros/', { params }),
  
  getRegistro: (id) =>
    axiosInstance.get(`/api/produccion/registros/${id}/`),
  
  createRegistro: (data) =>
    axiosInstance.post('/api/produccion/registros/', data),
  
  updateRegistro: (id, data) =>
    axiosInstance.put(`/api/produccion/registros/${id}/`, data),
  
  deleteRegistro: (id) =>
    axiosInstance.delete(`/api/produccion/registros/${id}/`),
}

// Servicios de analítica y KPIs
export const analiticaAPI = {
  getMetricas: (params = {}) =>
    axiosInstance.get('/api/analitica/metricas/', { params }),
  
  getRendimiento: (params = {}) =>
    axiosInstance.get('/api/analitica/rendimiento/', { params }),
  
  getAnomalias: (params = {}) =>
    axiosInstance.get('/api/analitica/anomalias/', { params }),
  
  getKPIs: (params = {}) =>
    axiosInstance.get('/api/analitica/kpis/', { params }),
}

// Servicios de Inteligencia Artificial
export const iaAPI = {
  simularProduccion: (orden_id, cantidad_trabajadores) =>
    axiosInstance.post('/api/ia/simular-produccion/', {
      orden_id,
      cantidad_trabajadores,
    }),
}
