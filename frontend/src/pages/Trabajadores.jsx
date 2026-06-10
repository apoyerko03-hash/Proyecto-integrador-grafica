import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  User,
  BarChart2,
  X,
} from 'lucide-react'

import api from '../api/axiosConfig'

const EMPTY = {
  username: '',
  password: '',
  nombres: '',
  apellidos: '',
  correo: '',
  rol_id: '',
  estado: true,
}

const Trabajadores = () => {
  const [trabajadores, setTrabajadores] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)

  const [showStats, setShowStats] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)

  const [form, setForm] = useState(EMPTY)

  // =========================
  // FETCH
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true)

      const [trabajadoresRes, rolesRes] =
        await Promise.all([
          api.get('/api/usuarios/trabajadores/'),
          api.get('/api/usuarios/roles/'),
        ])

      setTrabajadores(trabajadoresRes.data)
      setRoles(rolesRes.data)

    } catch (error) {
      console.error('ERROR FETCH:', error)

      if (error.response) {
        console.log(error.response.data)
      }

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // =========================
  // MODALES
  // =========================
  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY)
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditId(t.id)

    setForm({
      username: t.user?.username || '',
      password: '',
      nombres: t.nombres || '',
      apellidos: t.apellidos || '',
      correo: t.correo || '',
      rol_id: t.rol?.id || '',
      estado: t.estado,
    })

    setShowModal(true)
  }

  const openAnalysis = (t) => {
    setSelectedWorker(t)
    setShowStats(true)
  }

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const ok = window.confirm(
      '¿Eliminar trabajador?'
    )

    if (!ok) return

    try {
      await api.delete(
        `/api/usuarios/trabajadores/${id}/`
      )

      fetchData()

    } catch (error) {
      console.error(error)
      alert('Error eliminando')
    }
  }

  // =========================
  // SUBMIT
  // =========================
const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    if (editId) {

      // UPDATE
      const payload = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        rol_id: Number(form.rol_id),
        estado: form.estado,
      }

      await api.put(
        `/api/usuarios/trabajadores/${editId}/`,
        payload
      )

    } else {

      // CREATE
      const payload = {
        user: {
          username: form.username,
          password: form.password,
          email: form.correo,
        },

        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,

        rol_id: Number(form.rol_id),
      }

      await api.post(
        '/api/usuarios/trabajadores/',
        payload
      )
    }

    fetchData()
    setShowModal(false)

  } catch (error) {
    console.error(error)

    console.log(error.response?.data)

    alert(
      JSON.stringify(
        error.response?.data || {}
      )
    )
  }
}
  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-white">
        Cargando trabajadores...
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Trabajadores
          </h2>

          <p className="text-white/60">
            Gestión de personal
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-accent text-black px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {trabajadores.map((trab) => (
          <div
            key={trab.id}
            className="bg-card-dark border border-border-color rounded-2xl p-5"
          >
            <div className="flex justify-between mb-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <User
                    className="text-accent"
                    size={24}
                  />
                </div>

                <div>
                  <h3 className="text-white font-bold">
                    {trab.nombres}{' '}
                    {trab.apellidos}
                  </h3>

                  <p className="text-white/50 text-sm">
                    {trab.rol?.nombre}
                  </p>

                  <p className="text-white/40 text-xs">
                    {trab.correo}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  trab.estado
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {trab.estado
                  ? 'Activo'
                  : 'Inactivo'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() =>
                  openAnalysis(trab)
                }
                className="bg-blue-500/20 text-blue-400 rounded-lg py-2 flex items-center justify-center"
              >
                <BarChart2 size={16} />
              </button>

              <button
                onClick={() => openEdit(trab)}
                className="bg-white/5 text-white rounded-lg py-2 flex items-center justify-center"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() =>
                  handleDelete(trab.id)
                }
                className="bg-red-500/10 text-red-400 rounded-lg py-2 flex items-center justify-center"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="bg-card-dark border border-border-color rounded-2xl p-6 w-full max-w-xl"
          >
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editId
                  ? 'Editar'
                  : 'Nuevo Trabajador'}
              </h3>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {!editId && (
                <>
                  <input
                    type="text"
                    placeholder="Usuario"
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username:
                          e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-bg-dark text-black"
                  />

                  <input
                    type="password"
                    placeholder="Contraseña"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password:
                          e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-bg-dark text-black"
                  />
                </>
              )}

              <input
                type="text"
                placeholder="Nombres"
                required
                value={form.nombres}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombres:
                      e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-bg-dark text-black"
              />

              <input
                type="text"
                placeholder="Apellidos"
                required
                value={form.apellidos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    apellidos:
                      e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-bg-dark text-black"
              />

              <input
                type="email"
                placeholder="Correo"
                required
                value={form.correo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    correo:
                      e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-bg-dark text-black"
              />

              <select
                required
                value={form.rol_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rol_id:
                      e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-bg-dark text-black"
              >
                <option value="">
                  Seleccionar rol
                </option>

                {roles.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                  >
                    {r.nombre}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-5 py-2 rounded-lg border border-white/10 text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-white font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Trabajadores
