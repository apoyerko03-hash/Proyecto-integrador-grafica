import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Users,
  Loader,
  Trophy,
  ShieldCheck,
  Target,
} from 'lucide-react'

import KPICard from '../components/KPICard'
import BarChart3D from '../components/BarChart3D'
import GemeloDigital from '../components/GemeloDigital'

import {
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

import { analiticaAPI } from '../api/axiosConfig'

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalOrdenes: 0,
    eficiencia: 0,
    alertas: 0,
    trabajadoresActivos: 0,
  })

  const [rendimientoData, setRendimientoData] = useState([])
  const [anomalias, setAnomalias] = useState([])
  const [loading, setLoading] = useState(true)

  const [topData, setTopData] = useState({
    top_eficientes: [],
    top_anomalias: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulación de KPIs
        setKpis({
          totalOrdenes: 24,
          eficiencia: 87.5,
          alertas: 3,
          trabajadoresActivos: 12,
        })

        // Rendimiento semanal
        setRendimientoData([
          { fecha: 'Lun', rendimiento: 85, meta: 90 },
          { fecha: 'Mar', rendimiento: 88, meta: 90 },
          { fecha: 'Mié', rendimiento: 82, meta: 90 },
          { fecha: 'Jue', rendimiento: 91, meta: 90 },
          { fecha: 'Vie', rendimiento: 89, meta: 90 },
          { fecha: 'Sab', rendimiento: 79, meta: 90 },
          { fecha: 'Dom', rendimiento: 75, meta: 90 },
        ])

        // Estado anomalías
        setAnomalias([
          {
            nombre: 'Sin anomalías',
            valor: 145,
            fill: '#01c38e',
          },
          {
            nombre: 'Anomalías detectadas',
            valor: 12,
            fill: '#ef4444',
          },
        ])

        // Top trabajadores
        setTopData({
          top_eficientes: [
            {
              trabajador_id: 1,
              trabajador__nombres: 'Carlos',
              trabajador__apellidos: 'García',
              desviacion_tiempo: 0.42,
            },
            {
              trabajador_id: 2,
              trabajador__nombres: 'María',
              trabajador__apellidos: 'López',
              desviacion_tiempo: 0.58,
            },
            {
              trabajador_id: 3,
              trabajador__nombres: 'Juan',
              trabajador__apellidos: 'Pérez',
              desviacion_tiempo: 0.65,
            },
          ],

          top_anomalias: [
            {
              trabajador_id: 4,
              trabajador__nombres: 'Ana',
              trabajador__apellidos: 'Rodríguez',
              total_anomalias: 6,
            },
            {
              trabajador_id: 5,
              trabajador__nombres: 'Luis',
              trabajador__apellidos: 'Quispe',
              total_anomalias: 4,
            },
          ],
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <Loader
            className="animate-spin text-accent mx-auto mb-4"
            size={32}
          />
          <p className="text-text-secondary">
            Cargando dashboard...
          </p>
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
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-text-light mb-2">
          Dashboard
        </h2>

        <p className="text-text-secondary">
          Resumen de métricas clave y rendimiento en tiempo real
        </p>
      </div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard
          title="Total Órdenes"
          value={kpis.totalOrdenes}
          icon={TrendingUp}
          color="accent"
          trend={12}
        />

        <KPICard
          title="Eficiencia General"
          value={`${kpis.eficiencia}%`}
          icon={Zap}
          color="green"
          trend={5}
        />

        <KPICard
          title="Alertas IA"
          value={kpis.alertas}
          icon={AlertTriangle}
          color="orange"
          description="Anomalías detectadas"
        />

        <KPICard
          title="Trabajadores Activos"
          value={kpis.trabajadoresActivos}
          icon={Users}
          color="blue"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rendimiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card-dark rounded-xl p-6 border border-border-color shadow-card"
        >
          <h3 className="text-lg font-bold text-text-light mb-4">
            Rendimiento Semanal
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rendimientoData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />

              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.5)"
              />

              <YAxis stroke="rgba(255,255,255,0.5)" />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1e29',
                  border: '1px solid rgba(1,195,142,0.3)',
                  borderRadius: '8px',
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="rendimiento"
                stroke="#01c38e"
                dot={{ fill: '#01c38e' }}
              />

              <Line
                type="monotone"
                dataKey="meta"
                stroke="rgba(255,255,255,0.3)"
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card"
        >
          <h3 className="text-lg font-bold text-text-light mb-4">
            Estado de Anomalías
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={anomalias}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="valor"
                paddingAngle={2}
              >
                {anomalias.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                  />
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
            {anomalias.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />

                <span className="text-text-secondary">
                  {item.nombre}:{' '}
                  <span className="text-text-light font-medium">
                    {item.valor}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top workers + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top eficientes */}
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Trophy
                  size={16}
                  className="text-yellow-500"
                />
                Top 5 Consistencia
              </h3>

              <div className="space-y-3">
                {topData.top_eficientes.map((t, i) => (
                  <div
                    key={t.trabajador_id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 font-mono text-[10px] w-4">
                        {i + 1}
                      </span>

                      <p className="text-white text-xs font-medium">
                        {t.trabajador__nombres}{' '}
                        {t.trabajador__apellidos}
                      </p>
                    </div>

                    <span className="text-accent-primary font-mono text-[10px] font-bold">
                      σ:{' '}
                      {t.desviacion_tiempo?.toFixed(2) || '0.00'}h
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top anomalías */}
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <AlertTriangle
                  size={16}
                  className="text-red-500"
                />
                Top 5 Incidencias
              </h3>

              <div className="space-y-3">
                {topData.top_anomalias.map((t, i) => (
                  <div
                    key={t.trabajador_id}
                    className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 font-mono text-[10px] w-4">
                        {i + 1}
                      </span>

                      <p className="text-white text-xs font-medium">
                        {t.trabajador__nombres}{' '}
                        {t.trabajador__apellidos}
                      </p>
                    </div>

                    <span className="text-red-400 font-mono text-[10px] font-bold">
                      {t.total_anomalias} ANOM.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart 3D */}
          <BarChart3D
            data={[
              { label: 'Ene', value: 42 },
              { label: 'Feb', value: 58 },
              { label: 'Mar', value: 35 },
              { label: 'Abr', value: 71 },
              { label: 'May', value: 63 },
              { label: 'Jun', value: 89 },
            ]}
            title="Producción Mensual Consolidada"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* IA Status */}
          <div className="card p-6 bg-gradient-to-br from-[#1a2332] to-[#0d1117]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <ShieldCheck size={28} />
              </div>

              <div>
                <h4 className="text-white font-bold">
                  Estado de IA
                </h4>

                <p className="text-white/40 text-[10px] font-mono">
                  MODELO: ISOLATION FOREST v2.1
                </p>
              </div>
            </div>

            <p className="text-white/60 text-xs leading-relaxed mb-4">
              El sistema está analizando patrones en tiempo real.
            </p>

            <button className="w-full py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-accent-primary text-xs font-bold hover:bg-accent-primary hover:text-[#0d1117] transition-all">
              RE-ENTRENAR MODELO
            </button>
          </div>

          {/* Gemelo digital */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">
                Gemelo Digital 3D
              </h3>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />

                <span className="text-[10px] text-white/40 font-mono">
                  LIVE STREAM
                </span>
              </div>
            </div>

            <GemeloDigital
              hayAnomalia={
                topData.top_anomalias.length > 0
              }
              operario="SISTEMA CENTRAL"
            />
          </div>

          {/* Metas */}
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Target
                size={16}
                className="text-blue-400"
              />
              Metas de la Semana
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-white/40 uppercase font-mono">
                    Volumen de Producción
                  </span>

                  <span className="text-white font-bold">
                    82%
                  </span>
                </div>

                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[82%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-white/40 uppercase font-mono">
                    Reducción de Anomalías
                  </span>

                  <span className="text-white font-bold">
                    65%
                  </span>
                </div>

                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-primary w-[65%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas recientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card"
      >
        <h3 className="text-lg font-bold text-text-light mb-4">
          Alertas Recientes
        </h3>

        <div className="space-y-2">
          {[
            {
              id: 1,
              tarea: 'Soldadura Estación 3',
              tipo: 'Baja eficiencia',
              estado: 'Crítica',
            },
            {
              id: 2,
              tarea: 'Corte Estación 1',
              tipo: 'Mantenimiento',
              estado: 'Normal',
            },
            {
              id: 3,
              tarea: 'Ensamble Estación 2',
              tipo: 'Anomalía IA',
              estado: 'Crítica',
            },
          ].map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-dark border border-border-color hover:border-accent/50 transition"
            >
              <div className="flex-1">
                <p className="text-text-light font-medium">
                  {alerta.tarea}
                </p>

                <p className="text-text-secondary text-sm">
                  {alerta.tipo}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  alerta.estado === 'Crítica'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-accent/20 text-accent'
                }`}
              >
                {alerta.estado}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard