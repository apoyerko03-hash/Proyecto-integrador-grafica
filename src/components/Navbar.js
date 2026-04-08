import { Menu, Bell, User } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button onClick={onMenuClick} className="menu-button">
            <Menu size={24} />
          </button>
          <h1 className="navbar-title">MetalPro Analytics</h1>
        </div>
        <div className="navbar-right">
          <button className="nav-icon-button">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <button className="nav-icon-button">
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
