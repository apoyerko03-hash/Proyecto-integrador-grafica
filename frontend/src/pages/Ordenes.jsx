import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Archive,
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react'

import api from '../api/axiosConfig'

const ESTADOS = ['Pendiente', 'En progreso', 'Completada']

const EMPTY_FORM = {
  codigo: '',
  cliente: '',
  descripcion: '',
  fecha_entrega: '',
  estado: 'Pendiente',
}

const normalizeArray = (payload) => (Array.isArray(payload) ? payload : [])

const formatNumber = (value) => {
  const number = Number(value) || 0
  return Number.isInteger(number) ? number : number.toFixed(2)
}

const estadoColor = (estado) => {
  switch (estado) {
    case 'Completada':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'En progreso':
      return 'bg-accent/20 text-accent border border-accent/30'
    case 'Pendiente':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

export default function Ordenes() {
  const [ordenesActivas, setOrdenesActivas] = useState([])
  const [ordenesCompletadas, setOrdenesCompletadas] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTareasModal, setShowTareasModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [tab, setTab] = useState('activas')
  const [ordenDetalle, setOrdenDetalle] = useState(null)

  const ordenesVisibles = tab === 'activas' ? ordenesActivas : ordenesCompletadas

  const resumen = useMemo(() => ({
    activas: ordenesActivas.length,
    completadas: ordenesCompletadas.length,
    progresoPromedio: ordenesActivas.length
      ? ordenesActivas.reduce((sum, orden) => sum + (Number(orden.progreso) || 0), 0) / ordenesActivas.length
      : 0,
  }), [ordenesActivas, ordenesCompletadas])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [activasRes, completadasRes, clientesRes] = await Promise.all([
        api.get('/api/produccion/ordenes/'),
        api.get('/api/produccion/ordenes/completadas/'),
        api.get('/api/produccion/clientes/'),
      ])

      setOrdenesActivas(normalizeArray(activasRes.data))
      setOrdenesCompletadas(normalizeArray(completadasRes.data))
      setClientes(normalizeArray(clientesRes.data))
    } catch (error) {
      console.error('Error cargando ordenes:', error.response?.data || error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const clienteNombre = (cliente) => {
    if (cliente && typeof cliente === 'object') {
      return cliente.nombre || cliente.nombre_cliente || 'Sin cliente'
    }

    const encontrado = clientes.find((item) => Number(item.id) === Number(cliente))
    return encontrado?.nombre || 'Sin cliente'
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (orden) => {
    setForm({
      codigo: orden.codigo || '',
      cliente: orden.cliente?.id || orden.cliente || '',
      descripcion: orden.descripcion || '',
      fecha_entrega: orden.fecha_entrega || '',
      estado: orden.estado || 'Pendiente',
    })
    setEditId(orden.id)
    setShowModal(true)
  }

  const openTareas = (orden) => {
    setOrdenDetalle(orden)
    setShowTareasModal(true)
  }

  const marcarCompletada = async (orden) => {
    if (!window.confirm(`Marcar la orden ${orden.codigo} como completada?`)) return

    try {
      await api.put(`/api/produccion/ordenes/${orden.id}/`, {
        codigo: orden.codigo,
        cliente_id: orden.cliente?.id || orden.cliente,
        descripcion: orden.descripcion,
        fecha_entrega: orden.fecha_entrega,
        estado: 'Completada',
      })
      await fetchData()
      setTab('completadas')
    } catch (error) {
      console.error('Error completando orden:', error.response?.data || error)
      alert('No se pudo completar la orden')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const dataToSend = {
        codigo: form.codigo,
        cliente_id: Number(form.cliente),
        descripcion: form.descripcion,
        fecha_entrega: form.fecha_entrega,
        estado: form.estado,
      }

      if (editId) {
        await api.put(`/api/produccion/ordenes/${editId}/`, dataToSend)
      } else {
        await api.post('/api/produccion/ordenes/', dataToSend)
      }

      setShowModal(false)
      await fetchData()
      if (form.estado === 'Completada') setTab('completadas')
    } catch (error) {
      console.error('Error guardando orden:', error.response?.data || error)
      alert('Error al guardar la orden')
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-text-light">
        Cargando ordenes...
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-light">Ordenes de Trabajo</h2>
          <p className="mt-1 text-text-secondary">
            Gestion de ordenes, progreso real y baja logica por estado completado
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/30 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-bg-dark"
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg-dark"
          >
            <Plus size={18} />
            Nueva Orden
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border-color bg-card-dark p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Activas</p>
          <p className="mt-2 text-3xl font-black text-text-light">{resumen.activas}</p>
        </div>
        <div className="rounded-xl border border-border-color bg-card-dark p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Completadas</p>
          <p className="mt-2 text-3xl font-black text-green-400">{resumen.completadas}</p>
        </div>
        <div className="rounded-xl border border-border-color bg-card-dark p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Progreso Promedio</p>
          <p className="mt-2 text-3xl font-black text-accent">{formatNumber(resumen.progresoPromedio)}%</p>
        </div>
      </section>

      <div className="inline-flex rounded-lg border border-white/10 bg-card-dark p-1">
        <button
          type="button"
          onClick={() => setTab('activas')}
          className={`rounded-md px-4 py-2 text-sm font-bold transition ${tab === 'activas' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:text-text-light'}`}
        >
          Ordenes Activas
        </button>
        <button
          type="button"
          onClick={() => setTab('completadas')}
          className={`rounded-md px-4 py-2 text-sm font-bold transition ${tab === 'completadas' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:text-text-light'}`}
        >
          Ordenes Completadas
        </button>
      </div>

      <div className="grid gap-4">
        {ordenesVisibles.length === 0 ? (
          <div className="rounded-xl border border-border-color bg-card-dark p-10 text-center">
            <p className="text-text-secondary">
              {tab === 'activas' ? 'No existen ordenes activas.' : 'No existen ordenes completadas.'}
            </p>
          </div>
        ) : (
          ordenesVisibles.map((orden) => {
            const progreso = Number(orden.progreso) || 0
            return (
              <motion.div
                key={orden.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border-color bg-card-dark p-6 transition hover:border-accent/40"
              >
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/20">
                        <ClipboardList size={22} className="text-accent" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-text-light">{orden.codigo}</h3>
                        <p className="text-sm text-text-secondary">{clienteNombre(orden.cliente)}</p>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${estadoColor(orden.estado)}`}>
                        {orden.estado}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-text-secondary">{orden.descripcion || 'Sin descripcion'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openTareas(orden)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-accent/40 hover:text-accent"
                    >
                      <Eye size={16} />
                      Ver tareas
                    </button>

                    {tab === 'activas' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(orden)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-accent/40 hover:text-accent"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => marcarCompletada(orden)}
                          className="inline-flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-300 transition hover:bg-green-500 hover:text-white"
                        >
                          <CheckCircle2 size={16} />
                          Completar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm text-text-secondary">Progreso real</span>
                      <span className="text-sm font-medium text-accent">{formatNumber(progreso)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-dark">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progreso, 100)}%` }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border-color pt-3 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-text-secondary">Tareas</p>
                      <p className="text-sm text-text-light">
                        {orden.tareas_completadas || 0}/{orden.total_tareas || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Produccion</p>
                      <p className="text-sm text-text-light">
                        {formatNumber(orden.produccion_real_total)} / {formatNumber(orden.produccion_esperada_total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Entrega</p>
                      <p className="text-sm text-text-light">{orden.fecha_entrega || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Archivo logico</p>
                      <p className="text-sm text-text-light">{orden.estado === 'Completada' ? 'Archivada' : 'Activa'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-border-color bg-card-dark p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-light">{editId ? 'Editar Orden' : 'Nueva Orden'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-light">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-text-secondary">Codigo</label>
                <input
                  type="text"
                  required
                  value={form.codigo}
                  onChange={(event) => setForm({ ...form, codigo: event.target.value })}
                  className="w-full rounded-lg border border-border-color bg-bg-dark px-4 py-3 text-black outline-none transition focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-text-secondary">Cliente</label>
                <select
                  required
                  value={form.cliente}
                  onChange={(event) => setForm({ ...form, cliente: event.target.value })}
                  className="w-full rounded-lg border border-border-color bg-bg-dark px-4 py-3 text-black outline-none transition focus:border-accent"
                >
                  <option value="">Seleccionar...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-text-secondary">Descripcion</label>
                <textarea
                  required
                  rows={3}
                  value={form.descripcion}
                  onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                  className="w-full rounded-lg border border-border-color bg-bg-dark px-4 py-3 text-black outline-none transition focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Fecha Entrega</label>
                  <input
                    type="date"
                    required
                    value={form.fecha_entrega}
                    onChange={(event) => setForm({ ...form, fecha_entrega: event.target.value })}
                    className="w-full rounded-lg border border-border-color bg-bg-dark px-4 py-3 text-black outline-none transition focus:border-accent"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(event) => setForm({ ...form, estado: event.target.value })}
                    className="w-full rounded-lg border border-border-color bg-bg-dark px-4 py-3 text-black outline-none transition focus:border-accent"
                  >
                    {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-border-color px-5 py-2 text-text-secondary transition hover:bg-border-color"
                >
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-accent px-5 py-2 font-semibold text-bg-dark transition hover:opacity-90">
                  Guardar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showTareasModal && ordenDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowTareasModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-border-color bg-black p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">Tareas relacionadas</p>
                <h3 className="mt-1 text-xl font-bold text-text-light">{ordenDetalle.codigo}</h3>
                <p className="text-sm text-text-secondary">{clienteNombre(ordenDetalle.cliente)}</p>
              </div>
              <button type="button" onClick={() => setShowTareasModal(false)} className="text-text-secondary hover:text-text-light">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {(ordenDetalle.tareas || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 bg-bg-dark p-8 text-center text-sm text-white/35">
                  Esta orden no tiene tareas registradas.
                </div>
              ) : (
                ordenDetalle.tareas.map((tarea) => {
                  const avance = tarea.prod_esperada
                    ? Math.min((Number(tarea.produccion_real) / Number(tarea.prod_esperada)) * 100, 100)
                    : 0

                  return (
                    <div key={tarea.id} className="rounded-lg border border-white/10 bg-bg-dark p-4">
                      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-text-light">{tarea.nombre_tarea}</p>
                          <p className="text-xs text-text-secondary">
                            Tiempo estimado: {formatNumber(tarea.tiempo_estimado_horas)} h
                          </p>
                        </div>
                        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                          {formatNumber(avance)}%
                        </span>
                      </div>

                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${avance}%` }} />
                      </div>

                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>Real: {formatNumber(tarea.produccion_real)}</span>
                        <span>Esperada: {formatNumber(tarea.prod_esperada)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
