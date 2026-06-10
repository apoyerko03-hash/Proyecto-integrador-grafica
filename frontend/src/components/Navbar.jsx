import { motion } from 'framer-motion'
import { LogOut, User, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-card-dark border-b border-border-color sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Título y Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <h1 className="text-2xl font-bold text-text-light">
            Sistema de Soporte a Decisiones
          </h1>

        </motion.div>

        {/* Acciones del Usuario */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4"
        >
          {/* Notificaciones */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-border-color rounded-lg transition relative"
          >
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </motion.button>

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border-color">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center"
            >
              <User size={20} className="text-accent" />
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-text-light">
                {user?.nombre_completo || user?.username || 'Usuario'}
              </p>
              <p className="text-xs text-text-secondary">
                {user?.rol || 'Sin rol'}
              </p>
            </div>

            {/* Botón Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="ml-2 p-2 hover:bg-red-500/20 rounded-lg transition"
              title="Cerrar sesión"
            >
              <LogOut size={18} className="text-red-500" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </nav>
  )
}

export default Navbar
