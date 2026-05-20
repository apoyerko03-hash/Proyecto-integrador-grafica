import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, DollarSign, Users, TrendingUp, 
  Activity, Zap, Calendar, MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Planta3D from './Planta3D';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filters, setFilters] = useState({
    trabajadorId: '',
    fechaInicio: '',
    fechaFin: ''
  });
  
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState({
    eficienciaPromedio: 0,
    totalRegistros: 0,
    anomaliasDetectadas: 0,
    produccionTotal: 0
  });

  // Trabajadores mock data - in real app, fetch from API
  const trabajadores = [
    { id: 1, nombre: 'JUAN PÉREZ', rol: 'Operador' },
    { id: 2, nombre: 'MARÍA GONZÁLEZ', rol: 'Supervisor' },
    { id: 3, nombre: 'CARLOS LÓPEZ', rol: 'Técnico' },
    { id: 4, nombre: 'ANA MARTÍNEZ', rol: 'Operador' },
    { id: 5, nombre: 'LUIS RODRÍGUEZ', rol: 'Ayudante' }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field, date) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      // In real app, make API call to backend analytics endpoint
      // For demo, we'll generate mock data based on filters
      const mockData = generarDatosMock(filters);
      setChartData(mockData);
      
      // Update KPIs
      setKpis({
        eficienciaPromedio: (Math.random() * 0.5 + 0.8).toFixed(2),
        totalRegistros: mockData.reduce((sum, day) => sum + day.total, 0),
        anomaliasDetectadas: Math.floor(Math.random() * 5),
        produccionTotal: mockData.reduce((sum, day) => sum + day.produccion, 0)
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchChartData();
  }, [filters.trabajadorId, filters.fechaInicio, filters.fechaFin]);

  // Generate mock data for charts
  const generarDatosMock = (filters) => {
    const data = [];
    const startDate = filters.fechaInicio ? new Date(filters.fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.fechaFin ? new Date(filters.fechaFin) : new Date();
    
    let current = new Date(startDate);
    while (current <= endDate) {
      const dayData = {
        fecha: current.toISOString().split('T')[0],
        produccion: Math.floor(Math.random() * 100) + 50,
        eficiencia: Math.random() * 0.4 + 0.7,
        horas: Math.random() * 8 + 4,
        total: Math.floor(Math.random() * 20) + 5
      };
      data.push(dayData);
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }
    return data;
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="bg-card-primary/50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 sm:flex-none">
              <h1 className="text-3xl font-bold text-accent-primary">
                Panel de Control Industrial
              </h1>
              <p className="mt-1 text-sm text-white/60">
                Sistema de Soporte a Decisiones - Fábrica J.E.RKO
              </p>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-6">
              <div className="flex items-center gap-4">
                <ButtonVariant 
                  variante="outline" 
                  onClick={() => navigate('/trabajadores')}
                  icon={<Users size={20} />}
                >
                  Gestión de Personal
                </ButtonVariant>
                <ButtonVariant 
                  variante="secondary" 
                  onClick={() => navigate('/analitica')}
                  icon={<BarChart3 size={20} />}
                >
                  Analítica Detallada
                </ButtonVariant>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filters Section - Only show on Analytics page or when coming from analytics */}
          {location.pathname === '/analitica' && (
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-accent-primary">
                Filtros de Analítica
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Trabajador
                  </label>
                  <select
                    value={filters.trabajadorId}
                    onChange={handleFilterChange}
                    name="trabajadorId"
                    className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="">Todos los trabajadores</option>
                    {trabajadores.map(trabajador => (
                      <option key={trabajador.id} value={trabajador.id}>
                        {trabajador.nombre} ({trabajador.rol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e) => handleDateChange('fechaInicio', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleDateChange('fechaFin', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchChartData}
                    className="bg-accent-primary hover:bg-accent-primary/90 text-dark-bg px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Zap size={20} />
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KPIs Row */}
          <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white/50">
                  Eficiencia Promedio
                </div>
                <div className="text-2xl font-bold text-accent-primary">
                  {kpis.eficienciaPromedio}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Activity size={16} />
                <span>vs objetivo: 85%</span>
              </div>
            </div>
            
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white/50">
                  Total Registros
                </div>
                <div className="text-2xl font-bold text-white">
                  {kpis.totalRegistros}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar size={16} />
                <span>este mes</span>
              </div>
            </div>
            
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white/50">
                  Anomalías Detectadas
                </div>
                <div
  className={`text-2xl font-bold ${
    kpis.anomaliasDetectadas > 0
      ? 'text-red-400'
      : 'text-accent-primary'
  }`}
>
                  {kpis.anomaliasDetectadas}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Zap size={16} />
                <span>requieren atención</span>
              </div>
            </div>
            
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white/50">
                  Producción Total
                </div>
                <div className="text-2xl font-bold text-white">
                  {kpis.produccionTotal} unidades
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin size={16} />
                <span>en línea</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid gap-8">
            {/* Production Trend Chart */}
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4 text-accent-primary">
                Tendencia de Producción Diaria
              </div>
              {!loading && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={chartData.map(day => ({
                      name: day.fecha.split('-').reverse().join('/'),
                      produccion: day.produccion,
                      eficiencia: day.eficiencia * 100
                    }))}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeWidth={1} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      line={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      domain={[0, 'dataMax']}
                      line={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      wrapperStyle={{ background: 'rgba(19,45,70,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: '#fff', fontSize: 12 }}
                      contentStyle={{ color: '#fff', fontSize: 12 }}
                    />
                    <Legend 
                      verticalAlign="top" 
          height={36} 
        />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/50">Cargando datos de producción...</p>
                </div>
              )}
            </div>

            {/* Efficiency Chart */}
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4 text-accent-primary">
                Eficiencia por Día (%)
              </div>
              {!loading && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={chartData.map(day => ({
                      name: day.fecha.split('-').reverse().join('/'),
                      eficiencia: day.eficiencia * 100
                    }))}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeWidth={1} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      line={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      domain={[0, 100]}
                      line={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      wrapperStyle={{ background: 'rgba(19,45,70,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: '#fff', fontSize: 12 }}
                      contentStyle={{ color: '#fff', fontSize: 12 }}
                    />
                    <Legend 
                      verticalAlign="top" 
          height={36} 
        />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/50">Cargando datos de eficiencia...</p>
                </div>
              )}
            </div>

            {/* 3D Plant Section */}
            <div className="bg-card-primary/30 backdrop-blur rounded-xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4 text-accent-primary">
                Gemelo Digital de la Planta
              </div>
              <div className="aspect-w-16 aspect-h-9 bg-dark-bg rounded-lg overflow-hidden">
                <Planta3D 
                  onMachineClick={(machineData) => {
                    // In real app, this would open a modal with machine details
                    alert(`Máquina seleccionada: ${machineData.nombre}\nEstado: ${machineData.estado}\nOperador: ${machineData.operador}`);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper button component
const ButtonVariant = ({ variante = 'primary', children, onClick, icon, className = '' }) => {
  const baseClasses = 'flex items-center gap-2 rounded-lg font-medium transition-all duration-200';
  
  const variants = {
    primary: 'bg-accent-primary text-dark-bg hover:bg-accent-primary/90',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    outline: 'bg-transparent text-white hover:bg-white/10 border border-white/20'
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variante]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};