import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap,
  Mail,
  Lock,
  AlertCircle,
  User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const result = await login(form.username, form.password)

      if (result?.success) {
        navigate('/')
      } else {
        setError(result?.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error(err)
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card principal */}
        <div className="bg-card-dark rounded-2xl shadow-card p-8 border border-border-color">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: 'spring',
              }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <Zap className="text-accent" size={32} />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-text-light">
              J.E.RKO
            </h1>

            <p className="text-text-secondary text-sm mt-2">
              Sistema de Soporte a Decisiones
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Usuario
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-bg-dark border border-border-color rounded-lg pl-11 pr-4 py-3 placeholder-text-secondary focus:outline-none focus:border-accent transition text-black"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Contraseña
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />

                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                  className="text-black w-full bg-bg-dark border border-border-color rounded-lg pl-11 pr-4 py-3 placeholder-text-secondary focus:outline-none focus:border-accent transition"
                />
              </div>
            </div>

            {/* Botón */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-bg-dark font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span key="loading" className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-bg-dark border-t-transparent"></div>
                  Ingresando...
                </span>
              ) : (
                <span key="normal" className="flex items-center gap-2">
                  <Mail size={18} />
                  Ingresar al Sistema
                </span>
              )}
            </motion.button>
          </form>

          {/* Footer */}

        </div>

        {/* Texto inferior */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
          className="mt-8 text-center text-text-secondary/30 text-sm"
        >
          <p>
            Gestor de Equipo Robusto para el Kaizen en Operaciones
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login