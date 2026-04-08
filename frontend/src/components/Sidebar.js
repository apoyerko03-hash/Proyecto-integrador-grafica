import { Home, LayoutDashboard, Users, ClipboardList, FileText, Brain } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trabajadores', icon: Users, label: 'Trabajadores' },
  { path: '/produccion', icon: ClipboardList, label: 'Producción' },
  { path: '/ordenes', icon: FileText, label: 'Órdenes de Trabajo' },
  { path: '/ia', icon: Brain, label: 'Inteligencia Artificial' },
];

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
