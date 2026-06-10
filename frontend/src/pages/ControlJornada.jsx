import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, RefreshCw, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import api from '../api/axiosConfig'

const cardClass = 'rounded-xl border border-white/10 bg-[#132d46] p-5 shadow-card'

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

const localDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getRegistroDateKey = (registro) => {
  if (!registro.fecha_registro) return ''
  const date = new Date(registro.fecha_registro)
  return Number.isNaN(date.getTime()) ? '' : localDateKey(date)
}

const calcularEficiencia = (registro) => {
  const real = Number(registro.cant_producida) || 0
  const esperada = Number(registro.tarea?.prod_esperada) || 0

  if (esperada <= 0) return 0
  return Math.min((real / esperada) * 100, 100)
}

export default function ControlJornada() {
  const navigate = useNavigate()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRegistros = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/api/produccion/registros/')
      setRegistros(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Error cargando jornada operativa:', err.response?.data || err)
      setError('No se pudieron cargar los registros de la jornada.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  const todayKey = localDateKey(new Date())

  const registrosHoy = useMemo(
    () => registros.filter((registro) => getRegistroDateKey(registro) === todayKey),
    [registros, todayKey]
  )

  const resumen = useMemo(() => {
    const total = registrosHoy.length
    const anomalias = registrosHoy.filter((registro) => registro.es_anomalia).length
    const bajoRendimiento = registrosHoy.filter(
      (registro) => !registro.es_anomalia && calcularEficiencia(registro) < 70
    ).length
    const mitigaciones = anomalias + bajoRendimiento
    const horas = registrosHoy.reduce(
      (sum, registro) => sum + (Number(registro.tiempo_real_horas) || 0),
      0
    )
    const eficiencia = total
      ? registrosHoy.reduce((sum, registro) => sum + calcularEficiencia(registro), 0) / total
      : 0

    return { total, anomalias, bajoRendimiento, mitigaciones, horas, eficiencia }
  }, [registrosHoy])

  const handleMitigar = (registro) => {
    navigate('/ia', {
      state: {
        orden_id: registro.tarea?.orden,
        trabajador_id: typeof registro.trabajador === 'object'
          ? registro.trabajador?.id
          : registro.trabajador,
        origen: 'control-jornada',
      },
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-[#1a1e29]">
        <div className="text-center">
          <Spinner className="mx-auto mb-3 h-8 w-8 text-[#01c38e]" />
          <p className="text-sm text-white/40">Cargando jornada operativa...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 bg-[#1a1e29]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Control de Jornada Operativa</h2>
          <p className="mt-1 text-sm text-white/40">
            Seguimiento del trabajo registrado hoy y acciones de mitigacion.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRegistros}
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">Registros Hoy</p>
          <p className="mt-3 text-4xl font-black text-white">{resumen.total}</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">Anomalias IA</p>
          <p className="mt-3 text-4xl font-black text-red-400">{resumen.anomalias}</p>
          <p className="mt-2 text-xs text-white/40">
            {resumen.bajoRendimiento} caso(s) extra por bajo rendimiento
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">Horas Invertidas</p>
          <p className="mt-3 text-4xl font-black text-[#01c38e]">{formatNumber(resumen.horas)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">Eficiencia Media</p>
          <p className="mt-3 text-4xl font-black text-[#01c38e]">{formatNumber(resumen.eficiencia)}%</p>
        </div>
      </section>

      <section className={`${cardClass} overflow-hidden`}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Operarios con actividad hoy</h3>
          <p className="text-xs text-white/40">
            La accion de mitigacion aparece cuando la eficiencia baja de 70% o hay anomalia.
          </p>
        </div>

        {registrosHoy.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#1a1e29] px-4 py-10 text-center text-sm text-white/35">
            No hay registros de produccion para la fecha de hoy.
          </div>
        ) : (
          <div className="space-y-3">
            {registrosHoy.map((registro, index) => {
              const eficiencia = calcularEficiencia(registro)
              const requiereMitigacion = eficiencia < 70 || registro.es_anomalia
              const trabajador = registro.trabajador_nombre || 'Trabajador no identificado'
              const tarea = registro.tarea?.nombre_tarea || 'Tarea no identificada'

              return (
                <motion.div
                  key={registro.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid grid-cols-1 gap-4 rounded-lg border bg-[#1a1e29] p-4 lg:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_auto] lg:items-center ${
                    requiereMitigacion ? 'border-red-500/35' : 'border-white/10'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#01c38e]/10 text-[#01c38e]">
                      <User size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{trabajador}</p>
                      <p className="text-xs text-white/40">
                        Orden {registro.tarea?.orden_codigo || registro.tarea?.orden || '-'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Tarea</p>
                    <p className="mt-1 text-sm font-semibold text-white/75">{tarea}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Horas</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                      <Clock size={14} className="text-[#01c38e]" />
                      {formatNumber(registro.tiempo_real_horas)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Eficiencia</p>
                    <p className={`mt-1 text-sm font-black ${eficiencia < 70 ? 'text-red-400' : 'text-[#01c38e]'}`}>
                      {formatNumber(eficiencia)}%
                    </p>
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    {requiereMitigacion ? (
                      <button
                        type="button"
                        onClick={() => handleMitigar(registro)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#01c38e] px-4 py-2 text-xs font-black text-[#1a1e29] transition hover:opacity-90"
                      >
                        Simular Mitigación
                      </button>
                    ) : (
                      <span className="rounded-full bg-[#01c38e]/15 px-3 py-1 text-xs font-bold text-[#01c38e]">
                        En rango
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </motion.div>
  )
}
