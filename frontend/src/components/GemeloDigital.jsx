import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'

// Componente "Gemelo Digital" que simula el estado de las estaciones de trabajo en tiempo real
const GemeloDigital = () => {
  // Datos locales que simulan el flujo de trabajo actual en la planta
  const [tareas] = useState([
    {
      id: 1,
      estacion: 'Soldadura 1',
      tarea: 'Soldadura de chasis',
      trabajador: 'Carlos García',
      progreso: 85,
      eficiencia: 92,
      estado: 'activa',
      anomalia: false,
      tiempo_restante: '15 min',
    },
    {
      id: 2,
      estacion: 'Corte 2',
      tarea: 'Corte de perfiles',
      trabajador: 'Maria López',
      progreso: 45,
      eficiencia: 78,
      estado: 'activa',
      anomalia: true, // Estación con alerta detectada
      tiempo_restante: '35 min',
    },
    {
      id: 3,
      estacion: 'Ensamble 1',
      tarea: 'Ensamble de unidad',
      trabajador: 'Juan Pérez',
      progreso: 60,
      eficiencia: 88,
      estado: 'activa',
      anomalia: false,
      tiempo_restante: '25 min',
    },
    {
      id: 4,
      estacion: 'Pintura 1',
      tarea: 'Pintado y secado',
      trabajador: 'Ana Rodríguez',
      progreso: 90,
      eficiencia: 65,
      estado: 'activa',
      anomalia: true,
      tiempo_restante: '5 min',
    },
  ])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Encabezado */}
      <div>
        <h2 className="text-3xl font-bold text-text-light mb-2">Gemelo Digital</h2>
        <p className="text-text-secondary">
          Visualización en tiempo real de estaciones de trabajo y flujo operativo
        </p>
      </div>

      {/* Grid de Estaciones de Trabajo Interactivas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tareas.map((tarea, idx) => (
          <motion.div
            key={tarea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl p-5 border-2 transition cursor-pointer ${
              tarea.anomalia
                ? 'border-red-500/50 bg-red-500/5' // Estilo visual para anomalías
                : 'border-green-500/50 bg-green-500/5' // Estilo visual normal
            }`}
            whileHover={{ scale: 1.02, borderColor: '#01c38e' }}
          >
            {/* Header de la Estación: Estación y Estado (Check o Alerta) */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-text-light text-sm">{tarea.estacion}</h3>
                <p className="text-xs text-text-secondary mt-1">{tarea.tarea}</p>
              </div>
              {tarea.anomalia ? (
                // Icono de alerta animado si hay anomalía
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <AlertCircle className="text-red-500" size={20} />
                </motion.div>
              ) : (
                <CheckCircle className="text-green-500" size={20} />
              )}
            </div>

            {/* Información del Operador asignado */}
            <div className="bg-bg-dark rounded p-2 mb-3">
              <p className="text-xs text-text-secondary">Operario</p>
              <p className="text-sm font-medium text-text-light">{tarea.trabajador}</p>
            </div>

            {/* Barra de Progreso de la Tarea Actual */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-text-secondary">Progreso</span>
                <span className="text-xs text-accent font-bold">{tarea.progreso}%</span>
              </div>
              <div className="w-full h-2 bg-border-color rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tarea.progreso}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-accent"
                />
              </div>
            </div>

            {/* KPIs Rápidos: Eficiencia y Tiempo Restante */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs text-text-secondary">Eficiencia</p>
                <p className={`text-lg font-bold ${
                  tarea.eficiencia >= 85 ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {tarea.eficiencia}%
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Tiempo</p>
                <p className="text-lg font-bold text-accent">{tarea.tiempo_restante}</p>
              </div>
            </div>

            {/* Indicador de Latido: Simula que la estación está enviando datos */}
            <div className="flex items-center gap-2 pt-3 border-t border-border-color">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-accent rounded-full"
              />
              <span className="text-xs text-text-secondary">En operación (Live)</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resumen Agregado de toda la Planta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card-dark rounded-xl p-6 border border-border-color"
      >
        <h3 className="text-lg font-bold text-text-light mb-4">Resumen de Planta</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Estaciones Activas</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-accent mt-2"
            >
              {tareas.length}
            </motion.p>
          </div>

          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Eficiencia Promedio</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-green-500 mt-2"
            >
              {Math.round(tareas.reduce((acc, t) => acc + t.eficiencia, 0) / tareas.length)}%
            </motion.p>
          </div>

          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Alertas IA</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-red-500 mt-2"
            >
              {tareas.filter(t => t.anomalia).length}
            </motion.p>
          </div>

          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Progreso Global</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-accent mt-2"
            >
              {Math.round(tareas.reduce((acc, t) => acc + t.progreso, 0) / tareas.length)}%
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GemeloDigital
      