import { useState } from 'react';
import { Brain, AlertTriangle, TrendingDown, Info, Lightbulb, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { mockAIAlerts, mockWorkers } from '../data/mockData';

export default function IA() {
  const [analyzing, setAnalyzing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setShowRecommendations(true); }, 2000);
  };

  const getAlertIcon = (tipo) => {
    if (tipo === 'danger') return <AlertTriangle style={{ color: '#F44336' }} size={24} />;
    if (tipo === 'warning') return <TrendingDown style={{ color: '#FF9800' }} size={24} />;
    return <Info style={{ color: '#2196F3' }} size={24} />;
  };

  const recommendations = [
    { title: 'Capacitación Recomendada', description: 'Carlos Ramírez y Laura Sánchez requieren capacitación adicional en sus áreas para mejorar productividad.', priority: 'Alta' },
    { title: 'Redistribución de Carga', description: 'Se detectó desbalance en la carga de trabajo. Redistribuir tareas del turno noche al turno mañana.', priority: 'Media' },
    { title: 'Revisión de Equipos', description: 'El área de mecanizado muestra baja eficiencia. Revisar el estado de las máquinas.', priority: 'Alta' },
    { title: 'Optimización de Turnos', description: 'El turno de noche tiene 15% menos eficiencia. Considerar incentivos o rotación de personal.', priority: 'Media' },
  ];

  const lowPerformers = mockWorkers.filter(w => w.rendimiento < 70);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inteligencia Artificial</h1>
          <p className="page-subtitle">Análisis predictivo y recomendaciones inteligentes</p>
        </div>
        <Button onClick={handleAnalyze} variant="primary" disabled={analyzing}>
          {analyzing ? <><RefreshCw size={20} className="mr-2 animate-spin" />Analizando...</> : <><Brain size={20} className="mr-2" />Analizar Datos</>}
        </Button>
      </div>

      <div className="ai-summary">
        <Card>
          <div className="ai-summary-content">
            <div className="ai-summary-icon"><Brain size={48} /></div>
            <div className="ai-summary-text">
              <h2 className="ai-summary-title">Sistema de Análisis Inteligente</h2>
              <p className="ai-summary-description">Nuestro sistema de IA analiza constantemente el rendimiento de tu equipo, identifica patrones y proporciona recomendaciones para optimizar la productividad de tu planta industrial.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="ai-grid">
        <div className="ai-alerts-section">
          <Card title="Alertas y Detecciones" icon={<AlertTriangle size={20} />}>
            <div className="alerts-list">
              {mockAIAlerts.map((alert) => (
                <div key={alert.id} className={`alert alert-${alert.tipo}`}>
                  <div className="alert-icon">{getAlertIcon(alert.tipo)}</div>
                  <div className="alert-content">
                    <h4 className="alert-title">{alert.titulo}</h4>
                    <p className="alert-message">{alert.mensaje}</p>
                    <span className="alert-date">{alert.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Trabajadores con Bajo Rendimiento" icon={<TrendingDown size={20} />}>
            <div className="worker-list">
              {lowPerformers.map((worker) => (
                <div key={worker.id} className="worker-item">
                  <div>
                    <h4 className="worker-name">{worker.nombre}</h4>
                    <p className="worker-role">{worker.cargo} - {worker.area}</p>
                  </div>
                  <span className="badge badge-danger">{worker.rendimiento}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {showRecommendations && (
          <Card title="Recomendaciones del Sistema" icon={<Lightbulb size={20} />}>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-header">
                    <h4 className="recommendation-title">{rec.title}</h4>
                    <span className={`badge ${rec.priority === 'Alta' ? 'badge-danger' : 'badge-warning'}`}>{rec.priority}</span>
                  </div>
                  <p className="recommendation-description">{rec.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Card title="Insights y Tendencias">
        <div className="insights-grid">
          <div className="insight-card"><h4 className="insight-title">Tendencia de Productividad</h4><div className="insight-value">-3.2%</div><p className="insight-description">Disminución en los últimos 30 días</p></div>
          <div className="insight-card"><h4 className="insight-title">Mejor Horario</h4><div className="insight-value">Turno Mañana</div><p className="insight-description">23% más eficiente</p></div>
          <div className="insight-card"><h4 className="insight-title">Predicción Mensual</h4><div className="insight-value">1,180 unidades</div><p className="insight-description">Basado en tendencia actual</p></div>
        </div>
      </Card>
    </Layout>
  );
}
