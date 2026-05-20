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
    // Simulamos el análisis
    setTimeout(() => { 
      setAnalyzing(false); 
      setShowRecommendations(true); 
    }, 2000);
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
    <Layout title="Inteligencia Artificial" subtitle="Análisis predictivo y recomendaciones inteligentes">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          {/* Títulos movidos al Layout o manejados localmente sin duplicar Sidebar */}
        </div>
        
        {/* CORRECCIÓN: Contenedor estable para el botón para evitar el error de insertBefore */}
        <div key="ai-button-container">
          <Button onClick={handleAnalyze} variant="primary" disabled={analyzing}>
            <div className="flex items-center">
              {analyzing ? (
                <>
                  <RefreshCw size={20} className="mr-2 animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Brain size={20} className="mr-2" />
                  <span>Analizar Datos</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </div>

      <div className="ai-summary mb-6">
        <Card>
          <div className="ai-summary-content flex items-center gap-6 p-2">
            <div className="ai-summary-icon text-accent-primary"><Brain size={48} /></div>
            <div className="ai-summary-text">
              <h2 className="text-xl font-bold text-white mb-2">Sistema de Análisis Inteligente</h2>
              <p className="text-white/60 leading-relaxed">
                Nuestro sistema de IA analiza constantemente el rendimiento de tu equipo, identifica patrones y proporciona recomendaciones para optimizar la productividad de tu planta industrial.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          <Card title="Alertas y Detecciones" icon={<AlertTriangle size={20} />}>
            <div className="alerts-list space-y-4 mt-4">
              {mockAIAlerts.map((alert) => (
                <div key={alert.id} className={`alert alert-${alert.tipo} p-4 rounded-lg bg-white/5 border-l-4 ${alert.tipo === 'danger' ? 'border-red-500' : 'border-orange-500'}`}>
                  <div className="flex gap-4">
                    <div className="alert-icon shrink-0">{getAlertIcon(alert.tipo)}</div>
                    <div className="alert-content">
                      <h4 className="alert-title font-bold text-white">{alert.titulo}</h4>
                      <p className="alert-message text-sm text-white/60">{alert.mensaje}</p>
                      <span className="alert-date text-[10px] text-white/30 uppercase mt-2 block">{alert.fecha}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Trabajadores con Bajo Rendimiento" icon={<TrendingDown size={20} />}>
            <div className="worker-list space-y-3 mt-4">
              {lowPerformers.map((worker) => (
                <div key={worker.id} className="worker-item flex justify-between items-center p-3 rounded bg-white/5 border border-white/5">
                  <div>
                    <h4 className="worker-name text-white font-medium">{worker.nombre}</h4>
                    <p className="worker-role text-xs text-white/40">{worker.cargo} - {worker.area}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-bold">{worker.rendimiento}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          {showRecommendations ? (
            <Card title="Recomendaciones del Sistema" icon={<Lightbulb size={20} />}>
              <div className="recommendations-list space-y-4 mt-4">
                {recommendations.map((rec, index) => (
                  <div key={`rec-${index}`} className="recommendation-item p-4 rounded-lg bg-accent-primary/5 border border-accent-primary/10">
                    <div className="recommendation-header flex justify-between items-start mb-2">
                      <h4 className="recommendation-title text-white font-bold">{rec.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.priority === 'Alta' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="recommendation-description text-sm text-white/70">{rec.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-10 border-2 border-dashed border-white/5 rounded-xl">
              <p className="text-white/20 text-center italic">Haz clic en "Analizar Datos" para generar recomendaciones...</p>
            </div>
          )}
        </div>
      </div>

      <Card title="Insights y Tendencias">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="insight-card p-4 rounded bg-white/5 border border-white/5">
            <h4 className="text-xs text-white/40 uppercase mb-1">Tendencia de Productividad</h4>
            <div className="text-2xl font-bold text-red-400">-3.2%</div>
            <p className="text-[10px] text-white/30">Disminución en los últimos 30 días</p>
          </div>
          <div className="insight-card p-4 rounded bg-white/5 border border-white/5">
            <h4 className="text-xs text-white/40 uppercase mb-1">Mejor Horario</h4>
            <div className="text-2xl font-bold text-green-400">Turno Mañana</div>
            <p className="text-[10px] text-white/30">23% más eficiente</p>
          </div>
          <div className="insight-card p-4 rounded bg-white/5 border border-white/5">
            <h4 className="text-xs text-white/40 uppercase mb-1">Predicción Mensual</h4>
            <div className="text-2xl font-bold text-blue-400">1,180 unidades</div>
            <p className="text-[10px] text-white/30">Basado en tendencia actual</p>
          </div>
        </div>
      </Card>
    </Layout>
  );
}