import axios from 'axios'

// Configuración centralizada de Axios para las peticiones HTTP
const api = axios.create({
  baseURL: 'http://localhost:8000', // URL base del backend Django
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token de autenticación a cada petición saliente
api.interceptors.request.use(
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
api.interceptors.response.use(
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

export default api

// --- SERVICIOS DE API ORGANIZADOS POR MÓDULOS ---

// Servicios relacionados con usuarios y trabajadores
export const usuariosAPI = {
  login: (username, password) =>
    api.post('/api/usuarios/auth/login/', { username, password }),
  
  register: (data) =>
    api.post('/api/usuarios/register/', data),
  
  getPerfil: () =>
    api.get('/api/usuarios/usuarios/perfil/'),
  
  getTrabajadores: (params = {}) =>
    api.get('/api/usuarios/trabajadores/', { params }),
  
  getTrabajador: (id) =>
    api.get(`/api/usuarios/trabajadores/${id}/`),
  
  createTrabajador: (data) =>
    api.post('/api/usuarios/trabajadores/', data),
  
  updateTrabajador: (id, data) =>
    api.put(`/api/usuarios/trabajadores/${id}/`, data),
  
  deleteTrabajador: (id) =>
    api.delete(`/api/usuarios/trabajadores/${id}/`),
}

// Servicios para la gestión de órdenes de trabajo
export const ordenesAPI = {
  getOrdenes: (params = {}) =>
    api.get('/api/produccion/ordenes/', { params }),
  
  getOrden: (id) =>
    api.get(`/api/produccion/ordenes/${id}/`),
  
  createOrden: (data) =>
    api.post('/api/produccion/ordenes/', data),
  
  updateOrden: (id, data) =>
    api.put(`/api/produccion/ordenes/${id}/`, data),
  
  deleteOrden: (id) =>
    api.delete(`/api/produccion/ordenes/${id}/`),
}

// Servicios para el control de tareas
export const tareasAPI = {
  getTareas: (params = {}) =>
    api.get('/api/produccion/tareas/', { params }),
  
  getTarea: (id) =>
    api.get(`/api/produccion/tareas/${id}/`),
  
  createTarea: (data) =>
    api.post('/api/produccion/tareas/', data),
  
  updateTarea: (id, data) =>
    api.put(`/api/produccion/tareas/${id}/`, data),
  
  deleteTarea: (id) =>
    api.delete(`/api/produccion/tareas/${id}/`),
}

// Servicios para el registro de producción diaria
export const registrosAPI = {
  getRegistros: (params = {}) =>
    api.get('/api/produccion/registros/', { params }),
  
  getRegistro: (id) =>
    api.get(`/api/produccion/registros/${id}/`),
  
  createRegistro: (data) =>
    api.post('/api/produccion/registros/', data),
  
  updateRegistro: (id, data) =>
    api.put(`/api/produccion/registros/${id}/`, data),
  
  deleteRegistro: (id) =>
    api.delete(`/api/produccion/registros/${id}/`),
}

// Servicios de analítica y KPIs
export const analiticaAPI = {
  getMetricas: (params = {}) =>
    api.get('/api/analitica/metricas/', { params }),
  
  getRendimiento: (params = {}) =>
    api.get('/api/analitica/rendimiento/', { params }),
  
  getAnomalias: (params = {}) =>
    api.get('/api/analitica/anomalias/', { params }),
  
  getKPIs: (params = {}) =>
    api.get('/api/analitica/kpis/', { params }),
}

// Servicios de Inteligencia Artificial
export const iaAPI = {
  simularProduccion: (orden_id, cantidad_trabajadores) =>
    api.post('/api/ia/simular-produccion/', {
      orden_id,
      cantidad_trabajadores,
    }),
}
