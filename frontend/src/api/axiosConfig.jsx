import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

// Servicios de API específicos
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

export const clientesAPI = {
  getClientes: (params = {}) =>
    axiosInstance.get('/api/produccion/clientes/', { params }),
  
  getCliente: (id) =>
    axiosInstance.get(`/api/produccion/clientes/${id}/`),
  
  createCliente: (data) =>
    axiosInstance.post('/api/produccion/clientes/', data),
  
  updateCliente: (id, data) =>
    axiosInstance.put(`/api/produccion/clientes/${id}/`, data),
  
  deleteCliente: (id) =>
    axiosInstance.delete(`/api/produccion/clientes/${id}/`),
}

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
