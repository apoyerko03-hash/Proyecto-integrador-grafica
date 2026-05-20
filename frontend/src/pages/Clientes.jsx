import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Mail,
  MapPin,
  FileText,
  X
} from 'lucide-react'
import api from '../api/axios'

const EMPTY = {
  nombre: '',
  nit: '',
  correo: '',
  direccion: '',
}

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const fetchData = async () => {
    try {
      const res = await api.get('/produccion/clientes/')
      setClientes(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = () => {
    setForm(EMPTY)
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (cliente) => {
    setForm({
      nombre: cliente.nombre || '',
      nit: cliente.nit || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || '',
    })

    setEditId(cliente.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return

    try {
      await api.delete(`/produccion/clientes/${id}/`)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editId) {
        await api.put(`/produccion/clientes/${editId}/`, form)
      } else {
        await api.post('/produccion/clientes/', form)
      }

      fetchData()
      setShowModal(false)
    } catch (error) {
      alert(error.response?.data?.nit?.[0] || 'Error al guardar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary">Cargando clientes...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-light">
            Clientes
          </h2>

          <p className="text-text-secondary mt-1">
            Gestión de clientes y relaciones
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent text-bg-dark font-semibold py-2 px-4 rounded-lg"
        >
          <Plus size={18} />
          Nuevo Cliente
        </motion.button>
      </div>

      {/* Tabla */}
      <div className="bg-card-dark rounded-xl border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color bg-bg-dark/40">
                <th className="text-left px-6 py-4 text-text-secondary">
                  Cliente
                </th>

                <th className="text-left px-6 py-4 text-text-secondary">
                  NIT
                </th>

                <th className="text-left px-6 py-4 text-text-secondary">
                  Correo
                </th>

                <th className="text-left px-6 py-4 text-text-secondary">
                  Dirección
                </th>

                <th className="text-left px-6 py-4 text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-text-secondary"
                  >
                    Sin clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <motion.tr
                    key={cliente.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border-color hover:bg-bg-dark/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                          <Building2
                            className="text-accent"
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="text-text-light font-medium">
                            {cliente.nombre}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-text-secondary">
                      {cliente.nit}
                    </td>

                    <td className="px-6 py-4 text-text-secondary">
                      {cliente.correo}
                    </td>

                    <td className="px-6 py-4 text-text-secondary">
                      {cliente.direccion}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => openEdit(cliente)}
                          className="p-2 hover:bg-border-color rounded-lg transition"
                        >
                          <Edit
                            size={16}
                            className="text-text-secondary"
                          />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition"
                        >
                          <Trash2
                            size={16}
                            className="text-red-500"
                          />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card-dark border border-border-color rounded-2xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-light">
                {editId ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Nombre
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-3 top-3.5 text-text-secondary"
                  />

                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nombre: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-bg-dark border border-border-color rounded-lg pl-10 pr-4 py-3 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  NIT
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-3 top-3.5 text-text-secondary"
                  />

                  <input
                    type="number"
                    value={form.nit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nit: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-bg-dark border border-border-color rounded-lg pl-10 pr-4 py-3 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Correo
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-3.5 text-text-secondary"
                  />

                  <input
                    type="email"
                    value={form.correo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        correo: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-bg-dark border border-border-color rounded-lg pl-10 pr-4 py-3 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Dirección
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-3.5 text-text-secondary"
                  />

                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        direccion: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-bg-dark border border-border-color rounded-lg pl-10 pr-4 py-3 text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border-color text-text-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-bg-dark font-semibold"
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

export default Clientes