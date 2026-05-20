import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  Users,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  List
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  LineChart
} from 'recharts';

import { motion } from 'framer-motion';
import Planta3D from './Planta3D';

export default function AnaliticaDetalle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    trabajadorId: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [machineData, setMachineData] = useState([]);

  const trabajadores = [
    { id: 1, nombre: 'JUAN PÉREZ', rol: 'Operador' },
    { id: 2, nombre: 'MARÍA GONZÁLEZ', rol: 'Supervisor' },
    { id: 3, nombre: 'CARLOS LÓPEZ', rol: 'Técnico' },
    { id: 4, nombre: 'ANA MARTÍNEZ', rol: 'Operador' },
    { id: 5, nombre: 'LUIS RODRÍGUEZ', rol: 'Ayudante' }
  ];

  const machines = [
    {
      id: 1,
      nombre: 'CNC Tornillo 1',
      estado: 'Activo',
      operador: 'JUAN PÉREZ',
      eficiencia: 0.92,
      produccionHoy: 45
    },
    {
      id: 2,
      nombre: 'CNC Fresa 2',
      estado: 'Mantenimiento',
      operador: null,
      eficiencia: 0,
      produccionHoy: 0
    },
    {
      id: 3,
      nombre: 'Robot Soldadura 3',
      estado: 'Activo',
      operador: 'MARÍA GONZÁLEZ',
      eficiencia: 0.88,
      produccionHoy: 32
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field, date) => {
    setFilters((prev) => ({
      ...prev,
      [field]: date
    }));
  };

  const generarDatosMock = (filters) => {
    const data = [];

    const startDate = filters.fechaInicio
      ? new Date(filters.fechaInicio)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const endDate = filters.fechaFin
      ? new Date(filters.fechaFin)
      : new Date();

    let current = new Date(startDate);

    while (current <= endDate) {
      data.push({
        fecha: current.toISOString().split('T')[0],
        produccion: Math.floor(Math.random() * 100) + 50,
        eficiencia: Math.random() * 0.4 + 0.6,
        calidad: Math.random() * 0.1 + 0.9,
        horas: Math.random() * 8 + 4
      });

      current = new Date(
        current.getTime() + 24 * 60 * 60 * 1000
      );
    }

    return data;
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      const mockData = generarDatosMock(filters);

      setChartData(mockData);

      setStats({
        eficienciaPromedio: (
          mockData.reduce(
            (sum, day) => sum + day.eficiencia,
            0
          ) / mockData.length || 0
        ).toFixed(3),

        produccionTotal: mockData.reduce(
          (sum, day) => sum + day.produccion,
          0
        ),

        anomaliasDetectadas: Math.floor(
          Math.random() * 8
        ),

        horasTrabajadas: mockData
          .reduce((sum, day) => sum + day.horas, 0)
          .toFixed(1)
      });

      setMachineData(machines);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">

      <header className="bg-card-primary/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">

          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-3xl font-bold text-accent-primary">
                Analítica Detallada
              </h1>

              <p className="text-white/60">
                Monitoreo industrial
              </p>
            </div>

            <div className="flex gap-4">

              <ButtonVariant
                variante="outline"
                onClick={() => navigate('/dashboard')}
                icon={<Activity size={18} />}
              >
                Dashboard
              </ButtonVariant>

              <ButtonVariant
                variante="secondary"
                onClick={() => navigate('/trabajadores')}
                icon={<Users size={18} />}
              >
                Personal
              </ButtonVariant>

            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">

          {/* FILTROS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-primary/30 rounded-xl border border-white/5 p-6 mb-8"
          >

            <h2 className="text-xl font-semibold mb-4">
              Filtros
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <select
                value={filters.trabajadorId}
                onChange={handleFilterChange}
                name="trabajadorId"
                className="px-4 py-3 bg-dark-bg border border-white/10 rounded-lg"
              >
                <option value="">
                  Todos los trabajadores
                </option>

                {trabajadores.map((trabajador) => (
                  <option
                    key={trabajador.id}
                    value={trabajador.id}
                  >
                    {trabajador.nombre}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) =>
                  handleDateChange(
                    'fechaInicio',
                    e.target.value
                  )
                }
                className="px-4 py-3 bg-dark-bg border border-white/10 rounded-lg"
              />

              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) =>
                  handleDateChange(
                    'fechaFin',
                    e.target.value
                  )
                }
                className="px-4 py-3 bg-dark-bg border border-white/10 rounded-lg"
              />

              <button
                onClick={fetchAnalyticsData}
                className="bg-accent-primary text-black rounded-lg px-4 py-3 flex items-center gap-2"
              >
                <Zap size={18} />
                Aplicar
              </button>

            </div>
          </motion.div>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          >

            <StatCard
              title="Eficiencia"
              value={stats.eficienciaPromedio}
              icon={<TrendingUp size={16} />}
            />

            <StatCard
              title="Producción"
              value={stats.produccionTotal}
              icon={<List size={16} />}
            />

            <StatCard
              title="Anomalías"
              value={stats.anomaliasDetectadas}
              icon={<Zap size={16} />}
            />

            <StatCard
              title="Horas"
              value={stats.horasTrabajadas}
              icon={<Clock size={16} />}
            />

          </motion.div>

          {/* GRAFICOS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-8"
          >

            {/* BAR CHART */}
            <div className="bg-card-primary/30 rounded-xl border border-white/5 p-6">

              <h3 className="text-lg font-semibold mb-4">
                Producción Diaria
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData.map((day) => ({
                    name: day.fecha,
                    produccion: day.produccion
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />
                  <YAxis />

                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="produccion"
                    fill="#01c38e"
                  />
                </BarChart>
              </ResponsiveContainer>

            </div>

            {/* LINE CHART */}
            <div className="bg-card-primary/30 rounded-xl border border-white/5 p-6">

              <h3 className="text-lg font-semibold mb-4">
                Eficiencia y Calidad
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={chartData.map((day) => ({
                    name: day.fecha,
                    eficiencia: day.eficiencia * 100,
                    calidad: day.calidad * 100
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />
                  <YAxis />

                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="eficiencia"
                    stroke="#01c38e"
                  />

                  <Line
                    type="monotone"
                    dataKey="calidad"
                    stroke="#ffb400"
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>

            {/* PIE CHART */}
            <div className="bg-card-primary/30 rounded-xl border border-white/5 p-6">

              <h3 className="text-lg font-semibold mb-4">
                Estado de Máquinas
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>

                  <Pie
                    data={machineData.map((machine) => ({
                      name: machine.estado,
                      value: 1
                    }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >

                    {machineData.map((machine, index) => (
                      <Cell
                        key={index}
                        fill={getStatusColor(machine.estado)}
                      />
                    ))}

                  </Pie>

                </PieChart>
              </ResponsiveContainer>

            </div>

            {/* PLANTA 3D */}
            <div className="bg-card-primary/30 rounded-xl border border-white/5 p-6">

              <h3 className="text-lg font-semibold mb-4">
                Gemelo Digital
              </h3>

              <div className="h-[500px] rounded-lg overflow-hidden">

                <Planta3D
                  machines={machineData}
                  onMachineClick={(machine) => {
                    alert(
                      `Máquina: ${machine.nombre}`
                    );
                  }}
                />

              </div>

            </div>

          </motion.div>

        </div>
      </main>

    </div>
  );
}

const getStatusColor = (status) => {
  const colors = {
    Activo: '#01c38e',
    Mantenimiento: '#ffb400',
    Inactivo: '#ff4d4d'
  };

  return colors[status] || '#6b7280';
};

const ButtonVariant = ({
  variante = 'primary',
  children,
  onClick,
  icon
}) => {

  const variants = {
    primary:
      'bg-accent-primary text-black',

    secondary:
      'bg-white/10 text-white',

    outline:
      'border border-white/20 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${variants[variante]}`}
    >
      {icon}
      {children}
    </button>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-card-primary/30 rounded-xl border border-white/5 p-6">

    <div className="flex justify-between mb-3">

      <div className="text-white/50">
        {title}
      </div>

      <div className="text-2xl font-bold">
        {value || 0}
      </div>

    </div>

    <div className="flex items-center gap-2 text-sm text-white/60">
      {icon}
    </div>

  </div>
);