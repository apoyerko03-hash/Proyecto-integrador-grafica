import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Download, Filter, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

const getRegistroDate = (registro) => {
  const raw = registro.fecha_registro
  if (!raw) return null

  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

const toInputDate = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const getTrabajadorNombre = (registro, trabajadores) => {
  if (registro.trabajador_nombre) return registro.trabajador_nombre

  const id = typeof registro.trabajador === 'object'
    ? registro.trabajador?.id
    : registro.trabajador
  const trabajador = trabajadores.find((item) => Number(item.id) === Number(id))

  return trabajador
    ? `${trabajador.nombres} ${trabajador.apellidos}`
    : 'Trabajador no identificado'
}

const getTareaNombre = (registro) =>
  registro.tarea?.nombre_tarea || 'Tarea no identificada'

const calcularEficiencia = (registro) => {
  const real = Number(registro.cant_producida) || 0
  const esperada = Number(registro.tarea?.prod_esperada) || 0

  if (esperada <= 0) return 0
  return (real / esperada) * 100
}

const normalizarEficiencia = (value) => Math.min(Math.max(Number(value) || 0, 0), 100)

const buildCsvValue = (value) => {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export default function Analitica() {
  const [registros, setRegistros] = useState([])
  const [trabajadores, setTrabajadores] = useState([])
  const [trabajadorId, setTrabajadorId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [registrosRes, trabajadoresRes] = await Promise.all([
          api.get('/api/produccion/registros/'),
          api.get('/api/usuarios/trabajadores/'),
        ])

        setRegistros(Array.isArray(registrosRes.data) ? registrosRes.data : [])
        setTrabajadores(
          Array.isArray(trabajadoresRes.data) ? trabajadoresRes.data : []
        )
      } catch (err) {
        console.error('Error cargando analitica:', err.response?.data || err)
        setError('No se pudieron cargar los datos de analitica.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filas = useMemo(
    () =>
      registros.map((registro) => {
        const fecha = getRegistroDate(registro)
        const eficienciaReal = calcularEficiencia(registro)
        const eficiencia = normalizarEficiencia(eficienciaReal)
        const tiempoMinutos = (Number(registro.tiempo_real_horas) || 0) * 60
        const trabajadorNombre = getTrabajadorNombre(registro, trabajadores)
        const tareaNombre = getTareaNombre(registro)
        const trabajadorValue = typeof registro.trabajador === 'object'
          ? registro.trabajador?.id
          : registro.trabajador

        return {
          id: registro.id,
          trabajadorId: trabajadorValue,
          trabajadorNombre,
          tareaNombre,
          fecha,
          fechaInput: toInputDate(fecha),
          fechaLabel: formatDate(fecha),
          eficiencia,
          eficienciaReal,
          tiempoMinutos,
          esAnomalia: Boolean(registro.es_anomalia),
          cantProducida: Number(registro.cant_producida) || 0,
          prodEsperada: Number(registro.tarea?.prod_esperada) || 0,
        }
      }),
    [registros, trabajadores]
  )

  const filasFiltradas = useMemo(
    () =>
      filas.filter((fila) => {
        const matchTrabajador = !trabajadorId ||
          Number(fila.trabajadorId) === Number(trabajadorId)
        const matchDesde = !fechaDesde || (fila.fechaInput && fila.fechaInput >= fechaDesde)
        const matchHasta = !fechaHasta || (fila.fechaInput && fila.fechaInput <= fechaHasta)

        return matchTrabajador && matchDesde && matchHasta
      }),
    [filas, trabajadorId, fechaDesde, fechaHasta]
  )

  const kpis = useMemo(() => {
    const total = filasFiltradas.length
    const eficienciaPromedio = total
      ? filasFiltradas.reduce((sum, item) => sum + item.eficiencia, 0) / total
      : 0

    return {
      eficienciaPromedio,
      anomalias: filasFiltradas.filter((item) => item.esAnomalia).length,
      registros: total,
    }
  }, [filasFiltradas])

  const rendimientoDiario = useMemo(() => {
    const grupos = new Map()

    filasFiltradas.forEach((fila) => {
      if (!fila.fechaInput) return

      const actual = grupos.get(fila.fechaInput) || {
        fecha: fila.fechaInput,
        eficienciaTotal: 0,
        anomalias: 0,
        registros: 0,
      }

      actual.eficienciaTotal += fila.eficiencia
      actual.anomalias += fila.esAnomalia ? 1 : 0
      actual.registros += 1

      grupos.set(fila.fechaInput, actual)
    })

    return Array.from(grupos.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((item) => ({
        fecha: item.fecha,
          eficiencia: normalizarEficiencia(item.eficienciaTotal / item.registros),
        anomalias: item.anomalias,
      }))
  }, [filasFiltradas])

  const exportarCsv = () => {
    const headers = [
      'Trabajador',
      'Tarea Realizada',
      'Fecha',
      'Eficiencia',
      'Tiempo (m)',
      'Estado IA',
    ]

    const rows = filasFiltradas.map((fila) => [
      fila.trabajadorNombre,
      fila.tareaNombre,
      fila.fechaLabel,
      `${formatNumber(fila.eficiencia)}%`,
      formatNumber(fila.tiempoMinutos),
      fila.esAnomalia ? 'ANOMALIA' : 'NORMAL',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map(buildCsvValue).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-analitica-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-3 h-8 w-8 text-[#01c38e]" />
          <p className="text-sm text-white/40">Cargando analitica real...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 bg-[#1a1e29]"
    >
      <div>
        <h2 className="text-3xl font-bold text-white">Analitica Avanzada</h2>
        <p className="mt-1 text-sm text-white/40">
          Rendimiento historico, eficiencia y anomalias con datos reales.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className={cardClass}>
        <div className="mb-4 flex items-center gap-2">
          <Filter size={20} className="text-[#01c38e]" />
          <h3 className="text-lg font-bold text-white">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
              Trabajador
            </label>
            <select
              value={trabajadorId}
              onChange={(event) => setTrabajadorId(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1e29] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#01c38e]"
            >
              <option value="">Todos los trabajadores</option>
              {trabajadores.map((trabajador) => (
                <option key={trabajador.id} value={trabajador.id}>
                  {trabajador.nombres} {trabajador.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(event) => setFechaDesde(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1e29] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#01c38e]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(event) => setFechaHasta(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1e29] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#01c38e]"
            />
          </div>

          <button
            type="button"
            onClick={exportarCsv}
            disabled={filasFiltradas.length === 0}
            className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#01c38e] px-4 py-2.5 text-sm font-black text-[#1a1e29] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={17} />
            Exportar Reporte CSV
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={`${cardClass} min-h-[138px]`}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">
            Eficiencia Promedio
          </p>
          <p className="mt-1 text-xs text-white/40">Cumplimiento promedio, limitado a 100%.</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-4xl font-black text-[#01c38e]">
              {formatNumber(kpis.eficienciaPromedio)}
            </p>
            <span className="pb-1 text-lg font-bold text-[#01c38e]/70">%</span>
          </div>
        </div>

        <div className={`${cardClass} min-h-[138px]`}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">
            Total de Anomalias Detectadas
          </p>
          <p className="mt-1 text-xs text-white/40">Registros marcados por IA en el filtro.</p>
          <p className="mt-3 text-4xl font-black text-red-400">{kpis.anomalias}</p>
        </div>

        <div className={`${cardClass} min-h-[138px]`}>
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">
            Registros Visibles
          </p>
          <p className="mt-1 text-xs text-white/40">Filas actuales luego de aplicar filtros.</p>
          <p className="mt-3 text-4xl font-black text-white">{kpis.registros}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={19} className="text-[#01c38e]" />
            <h3 className="text-lg font-bold text-white">Rendimiento Diario</h3>
          </div>

          <div className="h-72">
            {rendimientoDiario.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#1a1e29] text-sm text-white/35">
                No hay registros con fecha para graficar.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rendimientoDiario} barCategoryGap="35%">
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="fecha" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value) => [`${formatNumber(value)}%`, 'Eficiencia']}
                    contentStyle={{
                      background: '#132d46',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="eficiencia" fill="#01c38e" radius={[6, 6, 0, 0]} name="Eficiencia (%)" minPointSize={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle size={19} className="text-red-400" />
            <h3 className="text-lg font-bold text-white">Anomalias por Dia</h3>
          </div>

          <div className="h-72">
            {rendimientoDiario.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#1a1e29] text-sm text-white/35">
                No hay registros con fecha para graficar.
              </div>
            ) : kpis.anomalias === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-white/10 bg-[#1a1e29] text-center">
                <p className="text-4xl font-black text-[#01c38e]">0</p>
                <p className="mt-2 text-sm text-white/45">No hay anomalias en el filtro actual.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rendimientoDiario} barCategoryGap="35%">
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="fecha" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#132d46',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="anomalias" fill="#ef4444" radius={[6, 6, 0, 0]} name="Anomalias" minPointSize={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className={`${cardClass} overflow-hidden`}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Tabla Historica ({filasFiltradas.length})
            </h3>
            <p className="text-xs text-white/40">
              Las filas corresponden exactamente a los filtros aplicados.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                <th className="px-4 py-3 text-left font-bold">Trabajador</th>
                <th className="px-4 py-3 text-left font-bold">Tarea Realizada</th>
                <th className="px-4 py-3 text-left font-bold">Fecha</th>
                <th className="px-4 py-3 text-left font-bold">Eficiencia</th>
                <th className="px-4 py-3 text-left font-bold">Tiempo (m)</th>
                <th className="px-4 py-3 text-left font-bold">Estado IA</th>
              </tr>
            </thead>

            <tbody>
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/35">
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((fila) => (
                  <tr
                    key={fila.id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {fila.trabajadorNombre}
                    </td>
                    <td className="px-4 py-3 text-white/60">{fila.tareaNombre}</td>
                    <td className="px-4 py-3 font-mono text-white/60">{fila.fechaLabel}</td>
                    <td className="px-4 py-3">
                      <span
                        className={fila.eficiencia >= 80 ? 'text-[#01c38e]' : 'text-yellow-300'}
                        title={`Valor bruto: ${formatNumber(fila.eficienciaReal)}%`}
                      >
                        {formatNumber(fila.eficiencia)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-white/60">
                      {formatNumber(fila.tiempoMinutos)}
                    </td>
                    <td className="px-4 py-3">
                      {fila.esAnomalia ? (
                        <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                          ANOMALIA
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#01c38e]/15 px-3 py-1 text-xs font-bold text-[#01c38e]">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  )
}
