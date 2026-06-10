import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Siren,
  Zap,
  Users,
  Trophy,
  ShieldCheck,
  Target,
} from 'lucide-react'

import KPICard from '../components/KPICard'
import BarChart3D from '../components/BarChart3D'
import GemeloDigital from '../components/GemeloDigital'
import api from '../api/axiosConfig'

import {
  Bar,
  BarChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const Spinner = ({ className = 'h-8 w-8' }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    aria-hidden="true"
  />
)

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const formatNumber = (value) => {
  const number = Number(value) || 0
  return Number.isInteger(number) ? String(number) : number.toFixed(2)
}

const getRegistroDate = (registro) => {
  const rawDate = registro.fecha_registro || registro.fecha || registro.created_at
  const date = rawDate ? new Date(rawDate) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

const calcularEficiencia = (registro) => {
  const real = Number(registro.cant_producida) || 0
  const esperada = Number(registro.tarea?.prod_esperada) || 0

  if (esperada <= 0) return 0
  return Math.min((real / esperada) * 100, 100)
}

const getTrabajadorId = (registro) => (
  typeof registro.trabajador === 'object'
    ? registro.trabajador?.id
    : registro.trabajador
)

const getTrabajadorNombre = (registro) => (
  registro.trabajador_nombre ||
  registro.trabajador?.nombre_completo ||
  [registro.trabajador?.nombres, registro.trabajador?.apellidos].filter(Boolean).join(' ') ||
  'Trabajador no identificado'
)

const agruparRendimientoDiario = (registros) => {
  const grouped = registros.reduce((acc, registro) => {
    const date = getRegistroDate(registro)
    if (!date) return acc

    const key = date.toISOString().slice(0, 10)
    if (!acc[key]) {
      acc[key] = { fecha: key, total: 0, eficiencia: 0 }
    }

    acc[key].total += 1
    acc[key].eficiencia += calcularEficiencia(registro)
    return acc
  }, {})

  return Object.values(grouped)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-7)
    .map((item) => ({
      fecha: item.fecha.slice(5),
      rendimiento: Number((item.eficiencia / item.total).toFixed(2)),
      meta: 90,
    }))
}

const agruparRendimientoPorTarea = (registros) => {
  const registrosOrdenados = [...registros].sort((a, b) => {
    const fechaA = getRegistroDate(a)?.getTime() || 0
    const fechaB = getRegistroDate(b)?.getTime() || 0
    return fechaB - fechaA
  })
  const fechaReferencia = getRegistroDate(registrosOrdenados[0])

  if (!fechaReferencia) return []

  const keyReferencia = fechaReferencia.toISOString().slice(0, 10)
  const registrosDelDia = registros.filter((registro) => {
    const fecha = getRegistroDate(registro)
    return fecha && fecha.toISOString().slice(0, 10) === keyReferencia
  })

  const grouped = registrosDelDia.reduce((acc, registro) => {
    const tarea = registro.tarea?.nombre_tarea || 'Sin tarea'
    if (!acc[tarea]) {
      acc[tarea] = { tarea, total: 0, eficiencia: 0 }
    }

    acc[tarea].total += 1
    acc[tarea].eficiencia += calcularEficiencia(registro)
    return acc
  }, {})

  return Object.values(grouped)
    .map((item) => ({
      tarea: item.tarea,
      rendimiento: Number((item.eficiencia / item.total).toFixed(2)),
    }))
    .sort((a, b) => b.rendimiento - a.rendimiento)
    .slice(0, 8)
}

const agruparProduccionMensual = (registros) => {
  const grouped = registros.reduce((acc, registro) => {
    const date = getRegistroDate(registro)
    if (!date) return acc

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[key]) {
      acc[key] = {
        label: `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`,
        value: 0,
      }
    }

    acc[key].value += Number(registro.cant_producida) || 0
    return acc
  }, {})

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, item]) => ({
      ...item,
      value: Number(item.value.toFixed(2)),
    }))
}

const agruparAnomaliasPorTrabajador = (anomalias) => {
  const grouped = anomalias.reduce((acc, registro) => {
    const id = getTrabajadorId(registro) || `registro-${registro.id}`
    if (!acc[id]) {
      acc[id] = {
        trabajador_id: id,
        nombre: getTrabajadorNombre(registro),
        total_anomalias: 0,
      }
    }

    acc[id].total_anomalias += 1
    return acc
  }, {})

  return Object.values(grouped)
    .sort((a, b) => b.total_anomalias - a.total_anomalias)
    .slice(0, 5)
}

const getRankingNombre = (item) => (
  item.trabajador ||
  item.nombre_completo ||
  [item.nombre, item.apellido].filter(Boolean).join(' ') ||
  [item.nombres, item.apellidos].filter(Boolean).join(' ') ||
  `Trabajador #${item.trabajador_id || '-'}`
)

const Dashboard = () => {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState({
    totalRegistros: 0,
    eficiencia: 0,
    alertas: 0,
    trabajadoresActivos: 0,
  })
  const [rendimientoData, setRendimientoData] = useState([])
  const [rendimientoTareasData, setRendimientoTareasData] = useState([])
  const [produccionMensual, setProduccionMensual] = useState([])
  const [anomaliasData, setAnomaliasData] = useState([])
  const [alertasRecientes, setAlertasRecientes] = useState([])
  const [topData, setTopData] = useState({
    top_eficientes: [],
    top_anomalias: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError('')

        const [registrosRes, anomalasRes, rankingRes] = await Promise.all([
          api.get('/api/produccion/registros/'),
          api.get('/api/produccion/registros/anomalas/'),
          api.get('/api/analitica/ranking-eficiencia/'),
        ])

        const registros = toArray(registrosRes.data)
        const anomalas = toArray(anomalasRes.data)
        const ranking = toArray(rankingRes.data)

        const totalRegistros = registros.length
        const eficiencia = totalRegistros
          ? registros.reduce((sum, registro) => sum + calcularEficiencia(registro), 0) / totalRegistros
          : 0
        const trabajadoresActivos = new Set(registros.map(getTrabajadorId).filter(Boolean)).size
        const normales = Math.max(totalRegistros - anomalas.length, 0)

        setKpis({
          totalRegistros,
          eficiencia: Number(eficiencia.toFixed(2)),
          alertas: anomalas.length,
          trabajadoresActivos,
        })

        setRendimientoData(agruparRendimientoDiario(registros))
        setRendimientoTareasData(agruparRendimientoPorTarea(registros))
        setProduccionMensual(agruparProduccionMensual(registros))
        setAnomaliasData([
          { nombre: 'Sin anomalias', valor: normales, fill: '#01c38e' },
          { nombre: 'Anomalias detectadas', valor: anomalas.length, fill: '#ef4444' },
        ])
        setTopData({
          top_eficientes: ranking.slice(0, 5),
          top_anomalias: agruparAnomaliasPorTrabajador(anomalas),
        })
        setAlertasRecientes(anomalas.slice(0, 5))
      } catch (err) {
        console.error('Error cargando dashboard:', err.response?.data || err)
        setError('No se pudieron cargar los datos reales del dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const metaSemanal = useMemo(() => {
    const promedio = rendimientoData.length
      ? rendimientoData.reduce((sum, item) => sum + item.rendimiento, 0) / rendimientoData.length
      : 0
    const reduccionAnomalias = kpis.totalRegistros
      ? Math.max(0, 100 - (kpis.alertas / kpis.totalRegistros) * 100)
      : 0

    return {
      produccion: Math.min(promedio, 100),
      anomalias: Math.min(reduccionAnomalias, 100),
    }
  }, [rendimientoData, kpis])

  const usarFallbackRendimiento = rendimientoData.length > 0 && rendimientoData.length < 2 && rendimientoTareasData.length > 0

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4 h-8 w-8 text-accent" />
          <p className="text-text-secondary">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-3xl font-bold text-text-light">Dashboard</h2>
        <p className="text-text-secondary">
          Resumen de metricas clave y rendimiento con datos reales del DSS
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <KPICard
          title="Total Registros"
          value={kpis.totalRegistros}
          icon={TrendingUp}
          color="accent"
          description="Registros de produccion"
        />

        <button type="button" onClick={() => navigate('/analitica')} className="text-left">
          <KPICard
            title="Eficiencia Promedio"
            value={`${formatNumber(kpis.eficiencia)}%`}
            icon={Zap}
            color="green"
            description="Click para ver analitica"
          />
        </button>

        <button type="button" onClick={() => navigate('/ia')} className="text-left">
          <KPICard
            title="Alertas IA"
            value={kpis.alertas}
            icon={Siren}
            color="orange"
            description="Anomalias detectadas"
          />
        </button>

        <KPICard
          title="Trabajadores Activos"
          value={kpis.trabajadoresActivos}
          icon={Users}
          color="blue"
          description="Con registros cargados"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border-color bg-card-dark p-6 shadow-card lg:col-span-2"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-light">
              {usarFallbackRendimiento ? 'Rendimiento por Tarea' : 'Rendimiento Diario'}
            </h3>
            {usarFallbackRendimiento && (
              <p className="mt-1 text-xs text-text-secondary">
                Aun no hay historial suficiente por dia; se muestra el rendimiento real del ultimo dia registrado.
              </p>
            )}
          </div>

          {rendimientoData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-white/35">
              No hay registros con fecha para graficar.
            </div>
          ) : usarFallbackRendimiento ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rendimientoTareasData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="tarea" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value) => [`${formatNumber(value)}%`, 'Rendimiento']}
                  contentStyle={{
                    backgroundColor: '#1a1e29',
                    border: '1px solid rgba(1,195,142,0.3)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="rendimiento" fill="#01c38e" radius={[6, 6, 0, 0]} minPointSize={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rendimientoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1e29',
                    border: '1px solid rgba(1,195,142,0.3)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="rendimiento" stroke="#01c38e" dot={{ fill: '#01c38e' }} />
                <Line type="monotone" dataKey="meta" stroke="rgba(255,255,255,0.3)" dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border-color bg-card-dark p-6 shadow-card"
        >
          <h3 className="mb-4 text-lg font-bold text-text-light">
            Estado de Anomalias
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={anomaliasData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="valor"
                paddingAngle={2}
              >
                {anomaliasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1e29',
                  border: '1px solid rgba(1,195,142,0.3)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 text-sm">
            {anomaliasData.map((item) => (
              <div key={item.nombre} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-text-secondary">
                  {item.nombre}:{' '}
                  <span className="font-medium text-text-light">{item.valor}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Trophy size={16} className="text-yellow-500" />
                Top 5 Eficiencia
              </h3>

              <div className="space-y-3">
                {topData.top_eficientes.length === 0 ? (
                  <p className="rounded-lg border border-white/5 bg-white/5 p-3 text-xs text-white/35">
                    Sin datos de ranking disponibles.
                  </p>
                ) : (
                  topData.top_eficientes.map((t, i) => (
                    <div
                      key={t.trabajador_id || i}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 font-mono text-[10px] text-white/20">{i + 1}</span>
                        <p className="text-xs font-medium text-white">
                          {getRankingNombre(t)}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-accent-primary">
                        {formatNumber((Number(t.eficiencia_promedio) || 0) * 100)}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Siren size={16} className="text-red-500" />
                Top 5 Incidencias
              </h3>

              <div className="space-y-3">
                {topData.top_anomalias.length === 0 ? (
                  <p className="rounded-lg border border-white/5 bg-white/5 p-3 text-xs text-white/35">
                    No hay incidencias registradas.
                  </p>
                ) : (
                  topData.top_anomalias.map((t, i) => (
                    <div
                      key={t.trabajador_id || i}
                      className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/5 p-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 font-mono text-[10px] text-white/20">{i + 1}</span>
                        <p className="text-xs font-medium text-white">{t.nombre}</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-red-400">
                        {t.total_anomalias} ANOM.
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button type="button" onClick={() => navigate('/analitica')} className="block text-left">
            <BarChart3D
              data={produccionMensual}
              title="Produccion Mensual Consolidada"
            />
          </button>
        </div>

        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-[#1a2332] to-[#0d1117] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/20 text-accent-primary">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h4 className="font-bold text-white">Estado de IA</h4>
                <p className="font-mono text-[10px] text-white/40">
                  MODELO: ISOLATION FOREST
                </p>
              </div>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-white/60">
              El sistema esta leyendo registros reales y alertas marcadas por el backend.
            </p>
            <button
              type="button"
              onClick={() => navigate('/ia')}
              className="w-full rounded-lg border border-accent-primary/20 bg-accent-primary/10 py-2 text-xs font-bold text-accent-primary transition-all hover:bg-accent-primary hover:text-[#0d1117]"
            >
              ABRIR CENTRO IA
            </button>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h3 className="text-sm font-semibold text-white">Gemelo Digital 3D</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
                <span className="font-mono text-[10px] text-white/40">LIVE STREAM</span>
              </div>
            </div>
            <GemeloDigital hayAnomalia={topData.top_anomalias.length > 0} operario="SISTEMA CENTRAL" />
          </div>

          <div className="card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Target size={16} className="text-blue-400" />
              Metas de la Semana
            </h3>

            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-[10px]">
                  <span className="font-mono uppercase text-white/40">Volumen de Produccion</span>
                  <span className="font-bold text-white">{formatNumber(metaSemanal.produccion)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-blue-500" style={{ width: `${metaSemanal.produccion}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-[10px]">
                  <span className="font-mono uppercase text-white/40">Registros Sin Anomalias</span>
                  <span className="font-bold text-white">{formatNumber(metaSemanal.anomalias)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-accent-primary" style={{ width: `${metaSemanal.anomalias}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border-color bg-card-dark p-6 shadow-card"
      >
        <h3 className="mb-4 text-lg font-bold text-text-light">Alertas Recientes</h3>

        <div className="space-y-2">
          {alertasRecientes.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-bg-dark p-4 text-sm text-white/35">
              No hay alertas recientes registradas por IA.
            </div>
          ) : (
            alertasRecientes.map((alerta) => (
              <button
                key={alerta.id}
                type="button"
                onClick={() => navigate('/ia')}
                className="flex w-full items-center justify-between rounded-lg border border-border-color bg-bg-dark p-3 text-left transition hover:border-accent/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-text-light">
                    {alerta.tarea?.nombre_tarea || 'Registro anomalo'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {getTrabajadorNombre(alerta)}
                  </p>
                </div>
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-500">
                  ANOMALIA
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard
