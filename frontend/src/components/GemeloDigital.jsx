import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react'
import api from '../api/axiosConfig'

const calcularProgreso = (real, esperada) => {
  const produccionReal = Number(real) || 0
  const produccionEsperada = Number(esperada) || 0

  if (produccionEsperada <= 0) return 0

  return Math.min(Math.round((produccionReal / produccionEsperada) * 100), 100)
}

const formatearNumero = (valor) => {
  const numero = Number(valor) || 0
  return Number.isInteger(numero) ? numero : numero.toFixed(2)
}

const GemeloDigital = () => {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTareas = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/api/produccion/tareas/')
      setTareas(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Error cargando tareas del gemelo digital:', err)
      setError('No se pudieron cargar las tareas de produccion.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTareas()
  }, [])

  const resumen = useMemo(() => {
    const total = tareas.length
    const progresoGlobal = total
      ? Math.round(
          tareas.reduce(
            (acc, tarea) =>
              acc + calcularProgreso(tarea.produccion_real, tarea.prod_esperada),
            0
          ) / total
        )
      : 0

    return {
      total,
      completadas: tareas.filter(
        (tarea) => calcularProgreso(tarea.produccion_real, tarea.prod_esperada) >= 100
      ).length,
      sinOperario: tareas.filter((tarea) => !tarea.trabajador_asignado).length,
      progresoGlobal,
    }
  }, [tareas])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[280px] rounded-xl border border-border-color bg-card-dark">
        <div className="text-center">
          <Loader className="animate-spin text-accent mx-auto mb-3" size={28} />
          <p className="text-text-secondary text-sm">Cargando gemelo digital...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-light mb-2">
            Gemelo Digital
          </h2>
          <p className="text-text-secondary">
            Visualizacion en tiempo real de tareas y avance de produccion
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTareas}
          className="p-2 rounded-lg border border-border-color text-text-secondary hover:text-accent hover:border-accent/60 transition"
          title="Actualizar tareas"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {tareas.length === 0 ? (
        <div className="rounded-xl border border-border-color bg-card-dark p-8 text-center">
          <p className="text-text-secondary text-sm">No hay tareas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {tareas.map((tarea, index) => {
            const progreso = calcularProgreso(
              tarea.produccion_real,
              tarea.prod_esperada
            )
            const completada = progreso >= 100
            const sinOperario = !tarea.trabajador_asignado

            return (
              <motion.div
                key={tarea.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                whileHover={{ y: -4, borderColor: '#01c38e' }}
                className="rounded-xl border border-border-color bg-[#132d46] p-5 shadow-card transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="text-[10px] text-text-secondary uppercase font-mono tracking-widest mb-1">
                      Tarea
                    </p>
                    <h3 className="text-text-light font-black text-lg leading-tight uppercase truncate">
                      {tarea.nombre_tarea || 'SIN NOMBRE'}
                    </h3>
                  </div>

                  {completada ? (
                    <CheckCircle className="text-accent shrink-0" size={22} />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse mt-1.5 shrink-0" />
                  )}
                </div>

                <div className="rounded-lg bg-bg-dark/70 border border-white/5 p-3 mb-4">
                  <p className="text-[10px] text-text-secondary uppercase font-mono mb-1">
                    Orden de Trabajo
                  </p>
                  <p className="text-accent font-bold text-sm">
                    {tarea.orden_codigo || `ORDEN #${tarea.orden || '-'}`}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-secondary">Progreso</span>
                    <span className="text-xs text-accent font-bold">
                      {progreso}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-bg-dark overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progreso}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={`h-full rounded-full ${
                        completada ? 'bg-accent' : 'bg-yellow-400'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-[10px] font-mono text-text-secondary">
                    <span>Real: {formatearNumero(tarea.produccion_real)}</span>
                    <span>Meta: {formatearNumero(tarea.prod_esperada)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  {sinOperario ? (
                    <span className="rounded-full bg-yellow-400/15 border border-yellow-400/40 px-3 py-1 text-[10px] font-bold text-yellow-300">
                      SIN OPERARIO
                    </span>
                  ) : (
                    <div className="min-w-0">
                      <p className="text-[10px] text-text-secondary uppercase font-mono">
                        Operario
                      </p>
                      <p className="text-text-light text-xs font-semibold truncate">
                        {tarea.trabajador_asignado}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card-dark rounded-xl p-6 border border-border-color"
      >
        <h3 className="text-lg font-bold text-text-light mb-4">
          Resumen de Planta
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Tareas Activas</p>
            <p className="text-3xl font-bold text-accent mt-2">{resumen.total}</p>
          </div>

          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Completadas</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {resumen.completadas}
            </p>
          </div>

          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Sin Operario</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {resumen.sinOperario}
            </p>
          </div>

          <div className="bg-bg-dark rounded-lg p-4">
            <p className="text-text-secondary text-sm">Progreso Global</p>
            <p className="text-3xl font-bold text-accent mt-2">
              {resumen.progresoGlobal}%
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GemeloDigital
