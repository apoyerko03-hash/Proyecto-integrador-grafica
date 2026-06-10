import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

// Importaciones existentes
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analitica from './pages/Analitica'
import Ordenes from './pages/Ordenes'
import Trabajadores from './pages/Trabajadores'
import Clientes from './pages/Clientes'

// --- NUEVAS IMPORTACIONES (Las que te faltaban) ---
import IA from './pages/IA'
import Produccion from './pages/Produccion'
import ControlJornada from './pages/ControlJornada'
import Registros from './pages/Registros'
import Roles from './pages/Roles'
import Tareas from './pages/Tareas'
import SimuladorPredictivo from './pages/SimuladorPredictivo'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analitica" element={<Analitica />} />
              <Route path="/ordenes" element={<Ordenes />} />
              <Route path="/trabajadores" element={<Trabajadores />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/predicciones" element={<SimuladorPredictivo />} />
              {/* --- NUEVAS RUTAS --- */}
              <Route path="/ia" element={<IA />} />
              <Route path="/control-jornada" element={<ControlJornada />} />
              <Route path="/produccion" element={<Produccion />} />
              <Route path="/registros" element={<Registros />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/tareas" element={<Tareas />} />
            </Route>
          </Route>

          {/* Redireccionar rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
