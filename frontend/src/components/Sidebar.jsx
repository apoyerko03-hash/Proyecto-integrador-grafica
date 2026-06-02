import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  Clipboard,
  Users,
  Building2,
  Zap,
  LogOut,
  Bot,      
  Home, 
  LogIn, 
  Factory, 
  FileText, 
  ShieldCheck, 
  CheckSquare
} from 'lucide-react'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  // Mock user temporal
  const user = {
    nombre_completo: 'Administrador',
    rol: 'Supervisor',
  }

  const handleLogout = () => {
    console.log('Cerrar sesión')
  }

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Analítica', icon: BarChart3, path: '/analitica' },
  { name: 'Clientes', icon: Building2, path: '/clientes' },
  { name: 'IA', icon: Bot, path: '/ia' },

  { name: 'Órdenes', icon: Clipboard, path: '/ordenes' },
  { name: 'Producción', icon: Factory, path: '/produccion' },
  { name: 'Registros', icon: FileText, path: '/registros' },
  { name: 'Tareas', icon: CheckSquare, path: '/tareas' },
  { name: 'Trabajadores', icon: Users, path: '/trabajadores' },
  {name: 'Predicciones', icon: ShieldCheck, path: '/predicciones'},
];

  const isActive = (path) => location.pathname === path

  return (
    <motion.aside
      initial={{ width: isOpen ? 240 : 80 }}
      animate={{ width: isOpen ? 240 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-card-dark h-screen border-r border-border-color flex flex-col sticky top-0"
    >
      {/* Header */}
      <div className="p-6 border-b border-border-color flex items-center justify-between">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <Zap className="text-accent" size={24} />
            <h1 className="text-lg font-bold text-text-light">J.E.RKO</h1>
          </motion.div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-border-color rounded-lg transition"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer ${
                  active
                    ? 'bg-accent/20 text-accent border-l-2 border-accent'
                    : 'text-text-secondary hover:bg-border-color'
                }`}
              >
                <Icon size={20} />

                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>


      {/* Footer */}
      <div className="p-4 border-t border-border-color">
        {isOpen && user && (
          <div className="mb-3">
            <p className="font-semibold text-text-light truncate">
              {user.nombre_completo}
            </p>

            <p className="text-xs text-text-secondary truncate font-mono">
              {user.rol}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 text-text-secondary hover:text-red-400 hover:bg-border-color rounded-lg transition-all ${
            !isOpen ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />

          {isOpen && <span className="text-sm">Cerrar sesión</span>}
        </button>

      </div>
    </motion.aside>
  )
}

export default Sidebar