import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Iconos específicos para la simulación
import { Clover, Clock, Users, AlertTriangle, Loader, Zap } from 'lucide-react'

import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { ordenesAPI, iaAPI } from '../api/axiosConfig'

// Página del Simulador Predictivo: Permite proyectar tiempos de producción usando modelos de IA
export default function SimuladorPredictivo() {
  // Estados para gestionar órdenes, carga, parámetros y resultados de simulación
  const [ordenes, setOrdenes] = useState([]) // Lista de órdenes disponibles
  const [loadingOrdenes, setLoadingOrdenes] = useState(true) // Estado de carga de órdenes
  const [loadingSimulacion, setLoadingSimulacion] = useState(false) // Estado de ejecución de IA
  const [sesgo, setSesgo] = useState(5) // Parámetro "What-if": cantidad de trabajadores
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('') // ID de la orden a simular
  const [resultado, setResultado] = useState(null) // Respuesta del modelo de IA
  const [mostrarResultado, setMostrarResultado] = useState(false) // Control de visibilidad del resultado

  // Al montar el componente, obtiene las órdenes de trabajo desde el backend
  useEffect(() => {
    ordenesAPI.getOrdenes().then((res) => {
      const lista = Array.isArray(res.data) ? res.data : []
      setOrdenes(lista)
      if (lista.length > 0) {
        // Selecciona la primera orden por defecto
        setOrdenSeleccionada(String(lista[0].id))
      }
    }).catch(console.error)
    .finally(() => setLoadingOrdenes(false))
  }, [])

  // Función principal para ejecutar la simulación llamando al backend de IA
  const handleSimular = async () => {
    if (!ordenSeleccionada) return
    setLoadingSimulacion(true)
    setMostrarResultado(false)
    setResultado(null)

    try {
      const cantidad = Math.max(1, sesgo)
      // Llama al servicio de IA con la orden y la cantidad de trabajadores (sesgo)
      const res = await iaAPI.simularProduccion(ordenSeleccionada, cantidad)
      setResultado(res.data)
      setMostrarResultado(true)
    } catch (error) {
      setResultado({ error: 'Error al ejecutar la simulación. Verifique los datos e intente nuevamente.' })
      setMostrarResultado(true)
    } finally {
      setLoadingSimulacion(false)
    }
  }

  // Cálculos derivados para la interfaz visual
  const totalPredicho = resultado?.tiempo_predicho_horas || 0
  const totalEstimado = resultado?.tiempo_estimado_horas || 0
  const pctAvance = totalEstimado > 0 ? Math.min((totalPredicho / totalEstimado) * 100, 200) : 0
  const hayRiesgo = resultado?.riesgo_retraso || false

  return (
    <Layout title="Simulador Predictivo IA" subtitle="Modelo What-if: pronóstico de tiempo de producción según cantidad de trabajadores">
      <div className="space-y-6">

        {/* ── Controles de Simulación (Modelo What-if) ── */}
        <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector de Orden de Trabajo */}
              <div>
                <label className="block text-xs text-[#7c8caf] uppercase font-mono mb-2 tracking-widest">
                  Orden de Trabajo
                </label>
                {loadingOrdenes ? (
                  <div key="loading-orders-msg" className="flex items-center gap-2 text-white/40 text-sm">
                    <Loader size={16} className="animate-spin" />
                    <span>Cargando órdenes…</span>
                  </div>
                ) : (
                  <select
                    key="select-order-input"
                    value={ordenSeleccionada}
                    onChange={(e) => { setOrdenSeleccionada(e.target.value); setMostrarResultado(false); setResultado(null) }}
                    className="w-full bg-[#0f2438] border border-[#1e3a5a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#01c38e] transition-colors"
                  >
                    <option value="" disabled>Seleccionar orden de trabajo…</option>
                    {ordenes.map((o) => (
                      <option key={o.id} value={String(o.id)}>
                        {o.codigo} — {o.cliente?.nombre || (typeof o.cliente === 'object' ? o.cliente.nombre : 'Sin cliente')}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Slider para ajustar el número de trabajadores en la simulación */}
              <div>
                <label className="block text-xs text-[#7c8caf] uppercase font-mono mb-2 tracking-widest">
                  Cantidad de Trabajadores (Escenario)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={sesgo}
                    onChange={(e) => { setSesgo(parseInt(e.target.value, 10)); setMostrarResultado(false); setResultado(null) }}
                    className="flex-1 h-2 rounded-full bg-[#132d46] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#01c38e] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(1,195,142,0.6)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#01c38e] [&::-moz-range-thumb]:border-none"
                    style={{ accentColor: '#01c38e' }}
                  />
                  <span className="text-white font-black text-2xl min-w-[2.5rem] text-center">{sesgo}</span>
                </div>
              </div>
            </div>

            {/* Botón para disparar el cálculo en el backend de IA */}
            <Button
              onClick={handleSimular}
              disabled={loadingSimulacion || !ordenSeleccionada || loadingOrdenes}
              className="w-full py-3.5 bg-gradient-to-r from-[#01c38e] to-[#009e6d] text-[#0d1117] font-bold uppercase tracking-[0.15em] text-sm hover:opacity-90 disabled:opacity-30 transition-opacity"
            >
              {loadingSimulacion ? (
                <span key="executing" className="flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" />
                  <span>Procesando con IA…</span>
                </span>
              ) : (
                <span key="idle" className="flex items-center justify-center gap-2">
                  <Zap size={18} />
                  <span>Calcular Pronóstico</span>
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* ── Visualización de resultados de la IA ── */}
        <AnimatePresence mode="wait">
          {mostrarResultado && resultado && !resultado.error && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Alerta si el modelo predice un riesgo de retraso */}
              {hayRiesgo && (
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-3 bg-red-950/50 border border-red-500/60 rounded-xl px-6 py-4"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-red-400" />
                  </div>
                  <p className="text-red-300 font-bold text-xs uppercase tracking-wider">
                    <span>{resultado.mensaje_riesgo || 'ALERTA: POSIBLE INCUMPLIMIENTO DE PLAZO'}</span>
                  </p>
                </motion.div>
              )}

              {/* Tiempo Predicho Final destacado */}
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 220 }}
                className="rounded-2xl border border-[#01c38e]/30 bg-gradient-to-br from-[#01c38e]/10 via-[#132d46]/60 to-[#132d46] p-10 text-center"
              >
                <p className="text-xs text-[#7c8caf] uppercase font-mono tracking-[0.25em] mb-5">
                  <span>Tiempo Predicho por IA</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Clock size={44} className="text-[#01c38e]" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-7xl font-black tracking-tight text-[#01c38e]"
                  >
                    {totalPredicho}
                  </motion.span>
                  <span className="text-3xl font-black text-[#01c38e]/70 mt-2"><span>h</span></span>
                </div>
                <p className="text-white/50 mt-3 text-sm">
                  <span>Equivale a </span><span className="text-white font-semibold">{resultado.tiempo_predicho_dias}<span> días</span></span><span> de producción estimada</span>
                </p>
              </motion.div>

              {/* Comparativa gráfica de tiempos */}
              <Card>
                <h3 className="text-white font-bold text-sm mb-6 tracking-wide flex items-center gap-2">
                  <Clover size={18} className="text-[#01c38e]" />
                  <span>Comparativa: Teórico vs. Predicho</span>
                </h3>
                <div className="space-y-7">
                  {/* Barra del tiempo estimado original (base teórica) */}
                  <div>
                    <div className="flex justify-between text-xs uppercase font-mono tracking-widest mb-2.5">
                      <span className="text-[#7c8caf]">Tiempo Teórico Inicial</span>
                      <span className="text-white/60">{totalEstimado}<span> h</span></span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#132d46] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
                        className="h-full rounded-full bg-[#4a6fa5]"
                      />
                    </div>
                  </div>

                  {/* Barra del tiempo predicho por el modelo de IA */}
                  <div>
                    <div className="flex justify-between text-xs uppercase font-mono tracking-widest mb-2.5">
                      <span className="text-[#7c8caf]">Tiempo Pronosticado</span>
                      <span className={hayRiesgo ? 'text-red-400 font-bold' : 'text-[#01c38e] font-bold'}>
                        {totalPredicho}<span> h</span>
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#132d46] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pctAvance, 100)}%` }}
                        transition={{ duration: 0.9, delay: 0.55, ease: 'easeOut' }}
                        className={`h-full rounded-full ${hayRiesgo ? 'bg-red-500' : 'bg-[#01c38e]'}`}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Grid de indicadores numéricos finales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center">
                  <Users size={32} className="text-[#01c38e] mx-auto mb-3" />
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.15em] mb-1"><span>Trabajadores</span></p>
                  <p className="text-3xl font-bold text-white">{resultado.cantidad_trabajadores}</p>
                </Card>
                <Card className="text-center">
                  <Clock size={32} className="text-[#4a6fa5] mx-auto mb-3" />
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.15em] mb-1"><span>Teórico</span></p>
                  <p className="text-3xl font-bold text-white">{resultado.tiempo_estimado_horas}<span className="text-base text-white/40 ml-1"><span>h</span></span></p>
                  <p className="text-xs text-white/30 mt-1">{resultado.tiempo_estimado_dias}<span> días</span></p>
                </Card>
                <Card className="text-center">
                  <Clover size={32} className={hayRiesgo ? 'text-red-400' : 'text-[#01c38e]'} mx-auto mb-3 />
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.15em] mb-1"><span>Predicho</span></p>
                  <p className={`text-3xl font-bold ${hayRiesgo ? 'text-red-400' : 'text-[#01c38e]'}`}>{resultado.tiempo_predicho_horas}<span className="text-base text-white/40 ml-1"><span>h</span></span></p>
                  <p className="text-xs text-white/30 mt-1">{resultado.tiempo_predicho_dias}<span> días</span></p>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  )
}
