import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock3,
  RefreshCw,
  Route,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react'

import Layout from '../components/Layout'
import api from '../api/axiosConfig'

const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-white/10 bg-[#132d46] p-5 shadow-card ${className}`}>
    {children}
  </div>
)

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-4 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#01c38e]/10 text-[#01c38e]">
      <Icon size={20} />
    </div>
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
    </div>
  </div>
)

const Spinner = ({ className = 'h-5 w-5' }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    aria-hidden="true"
  />
)

const formatNumber = (value) => {
  const number = Number(value) || 0
  return Number.isInteger(number) ? number : number.toFixed(2)
}

const chartTooltip = {
  background: '#132d46',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#fff',
}

const jornadaHoras = 8

export default function IA() {
  const location = useLocation()
  const flujoMitigacion = location.state?.origen === 'control-jornada'
  const ordenMitigacionId = location.state?.orden_id
  const trabajadorMitigacionId = location.state?.trabajador_id
  const [anomalias, setAnomalias] = useState([])
  const [ranking, setRanking] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [trabajadores, setTrabajadores] = useState([])
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('')
  const [cantidadTrabajadores, setCantidadTrabajadores] = useState(1)
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulando, setSimulando] = useState(false)
  const [error, setError] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError('')

      const [anomaliasRes, rankingRes, ordenesRes, trabajadoresRes] =
        await Promise.all([
          api.get('/api/produccion/registros/anomalas/'),
          api.get('/api/ia/ranking-eficiencia/'),
          api.get('/api/produccion/ordenes/'),
          api.get('/api/usuarios/trabajadores/'),
        ])

      const ordenesData = Array.isArray(ordenesRes.data) ? ordenesRes.data : []
      const trabajadoresData = Array.isArray(trabajadoresRes.data)
        ? trabajadoresRes.data
        : []

      setAnomalias(Array.isArray(anomaliasRes.data) ? anomaliasRes.data : [])
      setRanking(Array.isArray(rankingRes.data) ? rankingRes.data : [])
      setOrdenes(ordenesData)
      setTrabajadores(trabajadoresData)

      const ordenSugerida = ordenMitigacionId &&
        ordenesData.some((orden) => Number(orden.id) === Number(ordenMitigacionId))
          ? String(ordenMitigacionId)
          : ''

      if (ordenSugerida) {
        setOrdenSeleccionada(ordenSugerida)
      } else if (!ordenSeleccionada && ordenesData.length > 0) {
        setOrdenSeleccionada(String(ordenesData[0].id))
      }

      setCantidadTrabajadores((actual) =>
        Math.min(Math.max(actual, 1), Math.max(trabajadoresData.length, 1))
      )
    } catch (err) {
      console.error('Error cargando centro de IA:', err.response?.data || err)
      setError('No se pudo cargar la informacion predictiva del DSS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const maxTrabajadores = Math.max(trabajadores.length, 1)

  const ordenActual = useMemo(
    () => ordenes.find((orden) => String(orden.id) === String(ordenSeleccionada)),
    [ordenes, ordenSeleccionada]
  )

  const resultadoNormalizado = useMemo(() => {
    if (!resultado) return null

    return {
      horasBase: Number(resultado.tiempo_estimado_horas) || 0,
      horasPredichas: Number(resultado.tiempo_predicho_horas) || 0,
      diasPredichos: Number(resultado.tiempo_predicho_dias) || 0,
      trabajadores: Number(resultado.cantidad_trabajadores) || cantidadTrabajadores,
      riesgoRetraso: Boolean(resultado.riesgo_retraso),
      totalTrabajadores: Number(resultado.total_trabajadores_disponibles) || maxTrabajadores,
      capacidadUsada: Number(resultado.porcentaje_capacidad_usada) || 0,
      ordenesActivas: Number(resultado.ordenes_activas) || 0,
      otrasOrdenesActivas: Number(resultado.otras_ordenes_activas) || 0,
      ordenesMasUrgentes: Number(resultado.ordenes_mas_urgentes) || 0,
      ordenesProximas: Number(resultado.ordenes_proximas) || 0,
      riesgoDespriorizacion: Boolean(resultado.riesgo_despriorizacion),
      nivelRiesgoOperativo: resultado.nivel_riesgo_operativo || 'BAJO',
      recomendacionesBackend: Array.isArray(resultado.recomendaciones)
        ? resultado.recomendaciones
        : [],
    }
  }, [resultado, cantidadTrabajadores, maxTrabajadores])

  const comparativaTiempo = useMemo(() => {
    if (!resultadoNormalizado) return []

    return [
      { name: 'Base', horas: resultadoNormalizado.horasBase },
      { name: 'Predicho', horas: resultadoNormalizado.horasPredichas },
    ]
  }, [resultadoNormalizado])

  const analisisWhatIf = useMemo(() => {
    if (!resultadoNormalizado) return null

    const horasBase = resultadoNormalizado.horasBase
    const horasPredichas = resultadoNormalizado.horasPredichas
    const diferenciaHoras = horasBase - horasPredichas
    const porcentajeCambio = horasBase > 0 ? (diferenciaHoras / horasBase) * 100 : 0
    const jornadasBase = horasBase / jornadaHoras
    const jornadasPredichas = horasPredichas / jornadaHoras
    const ahorroJornadas = diferenciaHoras / jornadaHoras

    let estado = 'Escenario estable'
    let color = 'text-[#01c38e]'
    let borde = 'border-[#01c38e]/30'
    let fondo = 'bg-[#01c38e]/10'
    let lectura = 'La asignacion simulada reduce el tiempo estimado y mantiene una carga operativa razonable.'

    if (resultadoNormalizado.riesgoDespriorizacion || resultadoNormalizado.nivelRiesgoOperativo === 'ALTO') {
      estado = resultadoNormalizado.nivelRiesgoOperativo === 'ALTO'
        ? 'Riesgo operativo alto'
        : 'Riesgo de despriorizacion'
      color = 'text-yellow-200'
      borde = 'border-yellow-400/30'
      fondo = 'bg-yellow-400/10'
      lectura = 'La asignacion puede acelerar esta orden, pero consume una parte importante de la capacidad y puede afectar otras ordenes activas.'
    } else if (resultadoNormalizado.riesgoRetraso) {
      estado = 'Riesgo de retraso'
      color = 'text-yellow-200'
      borde = 'border-yellow-400/30'
      fondo = 'bg-yellow-400/10'
      lectura = 'El escenario mantiene riesgo de retraso. Conviene aumentar personal o revisar cuellos de botella antes de liberar la orden.'
    } else if (porcentajeCambio < 10) {
      estado = 'Mejora limitada'
      color = 'text-yellow-200'
      borde = 'border-yellow-400/30'
      fondo = 'bg-yellow-400/10'
      lectura = 'El cambio reduce poco el tiempo total. Agregar personal podria no justificar el costo operativo si no existe urgencia.'
    } else if (porcentajeCambio >= 35) {
      estado = 'Alto impacto'
      lectura = 'El escenario muestra una reduccion fuerte del tiempo. Es una buena configuracion si la orden tiene prioridad alta.'
    }

    const recomendaciones = []

    if (resultadoNormalizado.recomendacionesBackend.length > 0) {
      recomendaciones.push(...resultadoNormalizado.recomendacionesBackend)
    }

    if (resultadoNormalizado.riesgoDespriorizacion) {
      recomendaciones.push('Antes de confirmar, valide si las otras ordenes activas pueden quedar en espera durante esta asignacion.')
    }

    if (resultadoNormalizado.riesgoRetraso) {
      recomendaciones.push('Incrementar el personal en el slider y volver a simular para reducir el cuello de botella.')
      recomendaciones.push('Revisar las tareas de mayor tiempo estimado antes de iniciar la jornada.')
    } else if (porcentajeCambio >= 35) {
      recomendaciones.push('Usar esta asignacion si la orden es prioritaria o tiene fecha de entrega cercana.')
      recomendaciones.push('Validar disponibilidad de materiales para que el aumento de personal no quede bloqueado.')
    } else if (porcentajeCambio < 10) {
      recomendaciones.push('Mantener una asignacion conservadora si no hay urgencia, porque el ahorro es bajo.')
      recomendaciones.push('Probar con un trabajador menos o reasignar personal a otra orden critica.')
    } else {
      recomendaciones.push('Asignacion balanceada: mejora el tiempo sin sobredimensionar demasiado la jornada.')
      recomendaciones.push('Monitorear eficiencia en Control de Jornada durante la ejecucion.')
    }

    if (ranking.length > 0) {
      recomendaciones.push('Evitar asignar operarios con desviacion negativa fuerte a las tareas criticas de esta orden.')
    }

    return {
      estado,
      color,
      borde,
      fondo,
      lectura,
      diferenciaHoras,
      porcentajeCambio,
      jornadasBase,
      jornadasPredichas,
      ahorroJornadas,
      recomendaciones: [...new Set(recomendaciones)],
    }
  }, [resultadoNormalizado, ranking])

  const comparativaRendimiento = useMemo(
    () =>
      ranking.slice(0, 5).map((item) => ({
        name: item.trabajador?.split(' ')[0] || 'Trab.',
        real: Number(item.produccion_real) || 0,
        esperada: Number(item.produccion_esperada) || 0,
      })),
    [ranking]
  )

  const handleSimular = async () => {
    if (!ordenSeleccionada) return

    try {
      setSimulando(true)
      setResultado(null)
      setError('')

      const response = await api.post('/api/ia/simular-produccion/', {
        orden_id: Number(ordenSeleccionada),
        cantidad_trabajadores: Number(cantidadTrabajadores),
      })

      setResultado(response.data || {})
    } catch (err) {
      console.error('Error ejecutando simulacion:', err.response?.data || err)
      setError('No se pudo ejecutar la simulacion predictiva.')
    } finally {
      setSimulando(false)
    }
  }

  if (loading) {
    return (
      <Layout
        title="Centro de Inteligencia Predictiva"
        subtitle="DSS conectado a analitica real de produccion"
      >
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <Spinner className="mx-auto mb-3 h-8 w-8 text-[#01c38e]" />
            <p className="text-sm text-white/40">Cargando datos reales...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Centro de Inteligencia Predictiva"
      subtitle="Diagnostico DSS, anomalias y simulacion What-if en tiempo real"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#132d46] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#01c38e]/10 text-[#01c38e]">
              <Brain size={30} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Motor Predictivo DSS</h2>
              <p className="text-sm text-white/45">
                Datos activos: {anomalias.length} anomalias, {ranking.length} desviaciones, {ordenes.length} ordenes.
              </p>
              <p className="mt-1 text-xs font-mono text-white/35">
                Trabajadores registrados: {trabajadores.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#01c38e]/30 px-4 py-2 text-sm font-bold text-[#01c38e] transition hover:bg-[#01c38e] hover:text-[#1a1e29]"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {flujoMitigacion && (
          <div className="rounded-lg border border-[#01c38e]/30 bg-[#01c38e]/10 px-4 py-3 text-sm text-[#01c38e]">
            Modo mitigacion: orden {ordenMitigacionId || '-'} preseleccionada desde Control de Jornada
            {trabajadorMitigacionId ? ` para trabajador #${trabajadorMitigacionId}.` : '.'}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <SectionHeader
                icon={AlertTriangle}
                title="Alertas de Anomalias"
                subtitle="Registros marcados por deteccion de comportamiento irregular"
              />

              <div className="space-y-3">
                {anomalias.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-[#1a1e29] p-5 text-center text-sm text-white/35">
                    No hay anomalias registradas.
                  </div>
                ) : (
                  anomalias.map((registro, index) => (
                    <motion.div
                      key={registro.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-l-4 border-red-500 bg-[#1a1e29] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {registro.trabajador_nombre || 'Trabajador sin nombre'}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            {registro.tarea?.nombre_tarea || 'Tarea no identificada'}
                          </p>
                        </div>
                        <span className="rounded bg-red-500/15 px-2 py-1 text-[10px] font-bold text-red-300">
                          ISOLATION FOREST
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/50">
                        <span>Produccion: {formatNumber(registro.cant_producida)}</span>
                        <span>Tiempo: {formatNumber(registro.tiempo_real_horas)} h</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <SectionHeader
                icon={TrendingDown}
                title="Bajo Rendimiento"
                subtitle="Trabajadores con desviacion negativa contra produccion esperada"
              />

              <div className="space-y-3">
                {ranking.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-[#1a1e29] p-5 text-center text-sm text-white/35">
                    No hay desviaciones negativas en los registros actuales.
                  </div>
                ) : (
                  ranking.map((item, index) => (
                    <motion.div
                      key={item.trabajador_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-lg border border-white/10 bg-[#1a1e29] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{item.trabajador}</p>
                          <p className="text-[11px] text-white/40">
                            {item.registros} registro(s) analizados
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-red-400">
                            {formatNumber(item.desviacion)}
                          </p>
                          <p className="text-[10px] text-white/35">desviacion</p>
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{ width: `${Math.min(Number(item.rendimiento_porcentaje) || 0, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-mono text-white/40">
                        <span>Real: {formatNumber(item.produccion_real)}</span>
                        <span>Esperada: {formatNumber(item.produccion_esperada)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            {comparativaRendimiento.length > 0 && (
              <Card>
                <SectionHeader
                  icon={BarChart3}
                  title="Produccion Real vs Esperada"
                  subtitle="Comparacion simple de los trabajadores con mayor desviacion"
                />

                <div className="h-64 rounded-lg bg-[#1a1e29] p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparativaRendimiento} barGap={4}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={chartTooltip} />
                      <Bar dataKey="esperada" fill="#4a6fa5" radius={[4, 4, 0, 0]} name="Esperada" />
                      <Bar dataKey="real" fill="#ef4444" radius={[4, 4, 0, 0]} name="Real" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <SectionHeader
                icon={Zap}
                title="Prediccion & What-if"
                subtitle="Simula tiempos de entrega segun cantidad de operarios"
              />

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                    Orden de Trabajo
                  </label>
                  <select
                    value={ordenSeleccionada}
                    onChange={(event) => {
                      setOrdenSeleccionada(event.target.value)
                      setResultado(null)
                    }}
                    className="w-full rounded-lg border border-white/10 bg-[#1a1e29] px-4 py-3 text-sm text-white outline-none transition focus:border-[#01c38e]"
                  >
                    {ordenes.length === 0 ? (
                      <option value="">Sin ordenes disponibles</option>
                    ) : (
                      ordenes.map((orden) => (
                        <option key={orden.id} value={orden.id}>
                          {orden.codigo} - {orden.cliente?.nombre || 'Sin cliente'}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/45">
                      Trabajadores a simular
                    </label>
                    <span className="flex items-center gap-2 rounded-lg bg-[#01c38e]/10 px-3 py-1 text-lg font-black text-[#01c38e]">
                      <Users size={16} />
                      {cantidadTrabajadores}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={maxTrabajadores}
                    value={cantidadTrabajadores}
                    onChange={(event) => {
                      setCantidadTrabajadores(Number(event.target.value))
                      setResultado(null)
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1a1e29] accent-[#01c38e]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-mono text-white/35">
                    <span>1</span>
                    <span>{maxTrabajadores}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    Limite basado en trabajadores registrados en el sistema.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimular}
                  disabled={!ordenSeleccionada || simulando}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#01c38e] px-5 py-3 text-sm font-black uppercase tracking-widest text-[#1a1e29] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {simulando ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      <span>Simulando</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <BarChart3 size={18} />
                      <span>Simular</span>
                    </span>
                  )}
                </button>
              </div>
            </Card>

            <Card className="min-h-[320px]">
              <SectionHeader
                icon={ClipboardList}
                title="Resultado Predictivo"
                subtitle={ordenActual ? `Orden seleccionada: ${ordenActual.codigo}` : 'Seleccione una orden para simular'}
              />

              {!resultadoNormalizado ? (
                <div className="flex min-h-[210px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#1a1e29] p-8 text-center">
                  <p className="max-w-sm text-sm text-white/35">
                    Selecciona una orden y ajusta el numero de trabajadores. La simulacion comparara el tiempo base contra el escenario elegido.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {analisisWhatIf && (
                    <div className={`rounded-xl border ${analisisWhatIf.borde} ${analisisWhatIf.fondo} p-5`}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-[0.22em] ${analisisWhatIf.color}`}>
                            {analisisWhatIf.estado}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">
                            {analisisWhatIf.lectura}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[#1a1e29]/80 px-4 py-3 text-right">
                          <p className="text-[10px] uppercase tracking-widest text-white/35">Impacto</p>
                          <p className={`mt-1 text-2xl font-black ${analisisWhatIf.porcentajeCambio >= 0 ? 'text-[#01c38e]' : 'text-red-300'}`}>
                            {formatNumber(Math.abs(analisisWhatIf.porcentajeCambio))}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-[#01c38e]/30 bg-[#01c38e]/10 p-8 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#01c38e]/70">
                      Tiempo predicho
                    </p>
                    <div className="flex items-end justify-center gap-4">
                      <div>
                        <p className="text-6xl font-black text-[#01c38e]">
                          {formatNumber(resultadoNormalizado.diasPredichos)}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-white/40">dias</p>
                      </div>
                      <div className="pb-2 text-3xl font-black text-white/25">/</div>
                      <div>
                        <p className="text-4xl font-black text-white">
                          {formatNumber(resultadoNormalizado.horasPredichas)}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-white/40">horas</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#1a1e29] p-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/35">Horas base</p>
                      <p className="mt-1 text-xl font-bold text-white">
                        {formatNumber(resultadoNormalizado.horasBase)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#1a1e29] p-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/35">Operarios</p>
                      <p className="mt-1 text-xl font-bold text-white">
                        {resultadoNormalizado.trabajadores}
                      </p>
                    </div>
                  </div>

                  {analisisWhatIf && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-[#1a1e29] p-4">
                        <div className="mb-2 flex items-center gap-2 text-[#01c38e]">
                          <Clock3 size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Ahorro</p>
                        </div>
                        <p className="text-xl font-black text-white">
                          {formatNumber(Math.max(analisisWhatIf.diferenciaHoras, 0))} h
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">
                          {formatNumber(Math.max(analisisWhatIf.ahorroJornadas, 0))} jornada(s)
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#1a1e29] p-4">
                        <div className="mb-2 flex items-center gap-2 text-blue-300">
                          <Route size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Antes</p>
                        </div>
                        <p className="text-xl font-black text-white">
                          {formatNumber(analisisWhatIf.jornadasBase)}
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">jornadas de 8 h</p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#1a1e29] p-4">
                        <div className="mb-2 flex items-center gap-2 text-[#01c38e]">
                          <CheckCircle2 size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Despues</p>
                        </div>
                        <p className="text-xl font-black text-white">
                          {formatNumber(analisisWhatIf.jornadasPredichas)}
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">jornadas de 8 h</p>
                      </div>
                    </div>
                  )}

                  <div className={`rounded-lg border p-4 ${
                    resultadoNormalizado.riesgoDespriorizacion
                      ? 'border-yellow-400/30 bg-yellow-400/10'
                      : 'border-white/10 bg-[#1a1e29]'
                  }`}>
                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/55">
                          Impacto en capacidad de planta
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          Evalua si esta orden absorbe personal que podria requerirse en otras ordenes.
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black ${
                        resultadoNormalizado.nivelRiesgoOperativo === 'ALTO'
                          ? 'bg-red-500/20 text-red-300'
                          : resultadoNormalizado.nivelRiesgoOperativo === 'MEDIO'
                            ? 'bg-yellow-400/20 text-yellow-200'
                            : 'bg-[#01c38e]/15 text-[#01c38e]'
                      }`}>
                        RIESGO {resultadoNormalizado.nivelRiesgoOperativo}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="mb-2 flex justify-between text-[11px] font-mono text-white/45">
                        <span>Capacidad usada</span>
                        <span>
                          {formatNumber(resultadoNormalizado.capacidadUsada)}% ({resultadoNormalizado.trabajadores}/{resultadoNormalizado.totalTrabajadores})
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            resultadoNormalizado.capacidadUsada >= 90
                              ? 'bg-red-400'
                              : resultadoNormalizado.capacidadUsada >= 70
                                ? 'bg-yellow-300'
                                : 'bg-[#01c38e]'
                          }`}
                          style={{ width: `${Math.min(resultadoNormalizado.capacidadUsada, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-lg bg-[#1a1e29]/80 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-white/35">Otras ordenes</p>
                        <p className="mt-1 text-xl font-black text-white">{resultadoNormalizado.otrasOrdenesActivas}</p>
                      </div>
                      <div className="rounded-lg bg-[#1a1e29]/80 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-white/35">Mas urgentes</p>
                        <p className="mt-1 text-xl font-black text-yellow-200">{resultadoNormalizado.ordenesMasUrgentes}</p>
                      </div>
                      <div className="rounded-lg bg-[#1a1e29]/80 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-white/35">Vencen pronto</p>
                        <p className="mt-1 text-xl font-black text-white">{resultadoNormalizado.ordenesProximas}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#1a1e29] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/35">
                        Comparativa de tiempo
                      </p>
                      <p className="text-[10px] text-white/35">horas</p>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparativaTiempo}>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={chartTooltip} />
                          <Bar dataKey="horas" fill="#01c38e" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {resultadoNormalizado.riesgoRetraso && (
                    <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-semibold text-yellow-200">
                      Sugerencia de la IA: Incrementar el personal en el slider para mitigar el cuello de botella.
                    </div>
                  )}

                  {analisisWhatIf && (
                    <div className="rounded-lg border border-white/10 bg-[#1a1e29] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Brain size={17} className="text-[#01c38e]" />
                        <p className="text-xs font-black uppercase tracking-widest text-white/55">
                          Recomendaciones operativas
                        </p>
                      </div>
                      <div className="space-y-2">
                        {analisisWhatIf.recomendaciones.map((recomendacion) => (
                          <div key={recomendacion} className="flex gap-3 rounded-lg bg-white/[0.03] p-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#01c38e]" />
                            <p className="text-sm leading-relaxed text-white/65">{recomendacion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
