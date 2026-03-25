import { Link } from 'react-router-dom';
import { BarChart3, Users, Cog, Brain } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: <BarChart3 size={40} />, title: 'Análisis de Rendimiento', description: 'Monitorea el rendimiento de tu equipo en tiempo real con métricas detalladas.' },
    { icon: <Users size={40} />, title: 'Gestión de Personal', description: 'Administra toda la información de tus trabajadores de manera eficiente.' },
    { icon: <Cog size={40} />, title: 'Control de Producción', description: 'Registra y visualiza la producción diaria de tu planta industrial.' },
    { icon: <Brain size={40} />, title: 'Inteligencia Artificial', description: 'Predicciones y alertas inteligentes para optimizar tu operación.' },
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Sistema de Gestión de Rendimiento Laboral</h1>
          <p className="hero-subtitle">Optimiza la productividad de tu empresa metal mecánica con análisis inteligente y gestión integral</p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-secondary btn-lg">Ir al Dashboard</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Iniciar Sesión</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Funcionalidades Principales</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Comienza a optimizar tu producción hoy</h2>
        <p className="cta-subtitle">Únete a las empresas que han mejorado su rendimiento con nuestro sistema</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">Explorar Sistema</Link>
      </section>
    </div>
  );
}
