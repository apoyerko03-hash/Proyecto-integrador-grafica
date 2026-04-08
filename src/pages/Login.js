import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Cog } from 'lucide-react';
import Button from '../components/Button';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo"><Cog size={48} /></div>
          <h1 className="login-title">MetalPro Analytics</h1>
          <p className="login-subtitle">Gestión de Rendimiento Laboral</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div className="input-with-icon">
              <User size={20} className="input-icon" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@empresa.com" required className="input-field pl-10" />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-field pl-10" />
            </div>
          </div>
          <div className="login-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>
          <Button type="submit" variant="primary" className="w-full">Iniciar Sesión</Button>
        </form>
      </div>
    </div>
  );
}
