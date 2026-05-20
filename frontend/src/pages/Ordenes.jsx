import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ClipboardList,
} from 'lucide-react'

import api from '../api/axios'

const ESTADOS = [
  'Pendiente',
  'En progreso',
  'Completada',
]

const EMPTY_FORM = {
  codigo: '',
  cliente: '',
  descripcion: '',
  fecha_entrega: '',
  estado: 'Pendiente',
}

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([])
  const [clientes, setClientes] = useState([])

  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordenesRes, clientesRes] =
        await Promise.all([
          api.get('/produccion/ordenes/'),
          api.get('/produccion/clientes/'),
        ])

      console.log(
        'ORDENES:',
        ordenesRes.data
      )

      setOrdenes(
        Array.isArray(ordenesRes.data)
          ? ordenesRes.data
          : []
      )

      setClientes(
        Array.isArray(clientesRes.data)
          ? clientesRes.data
          : []
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
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

  const clienteNombre = (cliente) => {
    // SI VIENE OBJETO
    if (
      cliente &&
      typeof cliente === 'object'
    ) {
      return (
        cliente.nombre ||
        cliente.nombre_cliente ||
        'Sin cliente'
      )
    }

    // SI VIENE ID
    const encontrado = clientes.find(
      (c) => c.id === cliente
    )

    return (
      encontrado?.nombre || 'Sin cliente'
    )
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (orden) => {
    setForm({
      codigo: orden.codigo || '',
      cliente:
        orden.cliente?.id ||
        orden.cliente ||
        '',
      descripcion:
        orden.descripcion || '',
      fecha_entrega:
        orden.fecha_entrega || '',
      estado:
        orden.estado || 'Pendiente',
    })

    setEditId(orden.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        '¿Eliminar orden?'
      )
    )
      return

    try {
      // await api.delete(`/produccion/ordenes/${id}/`)

      setOrdenes((prev) =>
        prev.filter((o) => o.id !== id)
      )
    } catch (error) {
      console.error(error)
    }
  }

const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const dataToSend = {
      codigo: form.codigo,
      cliente_id: parseInt(form.cliente),
      descripcion: form.descripcion,
      fecha_entrega: form.fecha_entrega,
      estado: form.estado,
    }

    if (editId) {
      // EDITAR
      const response = await api.put(
        `/produccion/ordenes/${editId}/`,
        dataToSend
      )

      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === editId ? response.data : o
        )
      )
    } else {
      // CREAR
      const response = await api.post(
        '/produccion/ordenes/',
        dataToSend
      )

      setOrdenes((prev) => [
        ...prev,
        response.data,
      ])
    }

    setShowModal(false)

  } catch (error) {
    console.error(error)

    console.log(error.response?.data)

    alert('Error al guardar la orden')
  }
}

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-text-light">
        Cargando órdenes...
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-light">
            Órdenes de Trabajo
          </h2>

          <p className="text-text-secondary mt-1">
            Gestión de órdenes y
            producción
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent text-bg-dark font-semibold py-2 px-4 rounded-lg"
        >
          <Plus size={20} />
          Nueva Orden
        </motion.button>
      </div>

      {/* LISTADO */}
      <div className="grid gap-4">
        {ordenes.length === 0 ? (
          <div className="bg-card-dark rounded-xl border border-border-color p-10 text-center">
            <p className="text-text-secondary">
              No existen órdenes
              registradas
            </p>
          </div>
        ) : (
          ordenes.map((orden) => (
            <motion.div
              key={orden.id}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-card-dark rounded-xl p-6 border border-border-color hover:border-accent/40 transition"
            >
              <div className="flex items-start justify-between mb-5">
                {/* INFO */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-lg bg-accent/20 flex items-center justify-center">
                      <ClipboardList
                        size={22}
                        className="text-accent"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-text-light">
                        {orden.codigo}
                      </h3>

                      <p className="text-text-secondary text-sm">
                        {clienteNombre(
                          orden.cliente
                        )}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor(
                        orden.estado
                      )}`}
                    >
                      {orden.estado}
                    </span>
                  </div>

                  <p className="text-text-secondary text-sm mt-3">
                    {orden.descripcion}
                  </p>
                </div>

                {/* BOTONES */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{
                      scale: 1.1,
                    }}
                    className="p-2 hover:bg-border-color rounded-lg transition"
                  >
                    <Eye
                      size={18}
                      className="text-text-secondary"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.1,
                    }}
                    onClick={() =>
                      openEdit(orden)
                    }
                    className="p-2 hover:bg-border-color rounded-lg transition"
                  >
                    <Edit
                      size={18}
                      className="text-text-secondary"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.1,
                    }}
                    onClick={() =>
                      handleDelete(
                        orden.id
                      )
                    }
                    className="p-2 hover:bg-red-500/20 rounded-lg transition"
                  >
                    <Trash2
                      size={18}
                      className="text-red-500"
                    />
                  </motion.button>
                </div>
              </div>

              {/* PROGRESO */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-text-secondary">
                      Progreso
                    </span>

                    <span className="text-sm text-accent font-medium">
                      {orden.progreso || 0}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-bg-dark rounded-full overflow-hidden">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${
                          orden.progreso ||
                          0
                        }%`,
                      }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>

                {/* INFO EXTRA */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border-color">
                  <div>
                    <p className="text-xs text-text-secondary">
                      Tarea
                    </p>

                    <p className="text-sm text-text-light">
                      {orden.tarea
                        ?.nombre_tarea ||
                        'Sin tarea'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary">
                      Inicio
                    </p>

                    <p className="text-sm text-text-light">
                      {orden.fecha_inicio ||
                        '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary">
                      Entrega
                    </p>

                    <p className="text-sm text-text-light">
                      {orden.fecha_entrega ||
                        '-'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setShowModal(false)
          }
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="bg-card-dark border border-border-color rounded-2xl p-6 w-full max-w-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-light">
                {editId
                  ? 'Editar Orden'
                  : 'Nueva Orden'}
              </h3>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="text-text-secondary hover:text-text-light text-xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Código
                </label>

                <input
                  type="text"
                  required
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      codigo:
                        e.target.value,
                    })
                  }
                  className="w-full bg-bg-dark border border-border-color rounded-lg px-4 py-3 text-black focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Cliente
                </label>

                <select
                  required
                  value={form.cliente}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cliente:
                        e.target.value,
                    })
                  }
                  className="w-full bg-bg-dark border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:border-accent"
                >
                  <option value="">
                    Seleccionar...
                  </option>

                  {clientes.map(
                    (cliente) => (
                      <option
                        key={
                          cliente.id
                        }
                        value={
                          cliente.id
                        }
                      >
                        {cliente.nombre}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Descripción
                </label>

                <textarea
                  required
                  rows={3}
                  value={
                    form.descripcion
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descripcion:
                        e.target.value,
                    })
                  }
                  className="w-full bg-bg-dark border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Fecha Entrega
                  </label>

                  <input
                    type="date"
                    required
                    value={
                      form.fecha_entrega
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fecha_entrega:
                          e.target.value,
                      })
                    }
                    className="w-full bg-bg-dark border border-border-color rounded-lg px-4 py-3 text-black focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Estado
                  </label>

                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estado:
                          e.target.value,
                      })
                    }
                    className="w-full bg-bg-dark border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:border-accent"
                  >
                    {ESTADOS.map(
                      (estado) => (
                        <option
                          key={estado}
                          value={estado}
                        >
                          {estado}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-5 py-2 rounded-lg border border-border-color text-text-secondary hover:bg-border-color transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-bg-dark font-semibold hover:opacity-90 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default Ordenes