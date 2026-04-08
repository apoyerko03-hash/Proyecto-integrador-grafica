import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, FileText, Activity, AlertTriangle, Award, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import Card from '../components/Card';
import Table from '../components/Table';
import { dashboardMetrics, mockWorkers, mockWorkOrders } from '../data/mockData';
import GemeloDigital from '../components/GemeloDigital';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [datosMaquina, setDatosMaquina] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [forzarFallo, setForzarFallo] = useState(false);

  useEffect(() => {
    // Creamos una función para pedir datos
    const pedirDatos = () => {
      // Si el botón está activado, le enviamos "?fallo=true" a Django
      const url = `http://127.0.0.1:8000/api/rendimiento/?fallo=${forzarFallo}`;
      
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setDatosMaquina(data);
          setCargando(false);
        })
        .catch(err => console.error(err));
    };

    pedirDatos();
    const intervalo = setInterval(pedirDatos, 3000);

    return () => clearInterval(intervalo);
    
  }, [forzarFallo]); 
//tablitas
  const topPerformers = [...mockWorkers].sort((a, b) => b.rendimiento - a.rendimiento).slice(0, 3);
  const recentOrders = mockWorkOrders.slice(0, 4);

  const workerColumns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Cargo', accessor: 'cargo' },
    {
      header: 'Rendimiento', accessor: 'rendimiento',
      render: (value) => <span className={`badge ${value >= 80 ? 'badge-success' : value >= 60 ? 'badge-warning' : 'badge-danger'}`}>{value}%</span>,
    },
  ];

  const orderColumns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Cliente', accessor: 'cliente' },
    {
      header: 'Estado', accessor: 'estado',
      render: (value) => {
        const colors = { 'En Proceso': 'badge-info', 'Completada': 'badge-success', 'Pendiente': 'badge-warning', 'Retrasada': 'badge-danger' };
        return <span className={`badge ${colors[value]}`}>{value}</span>;
      },
    },
    {
      header: 'Progreso', accessor: 'progreso',
      render: (value) => (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${value}%` }}>{value}%</div>
        </div>
      ),
    },
  ];
//graficos
  const chartData = {
    //horas de las últimas lecturas para el eje X
    labels: datosMaquina ? datosMaquina.ultimas_lecturas.map(lec => `Hora ${lec.hora}`) : [],
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: datosMaquina ? datosMaquina.ultimas_lecturas.map(lec => lec.temperatura) : [],
        borderColor: '#ff4d4d',
        backgroundColor: 'rgba(255, 77, 77, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Vibración (mm/s)',
        data: datosMaquina ? datosMaquina.ultimas_lecturas.map(lec => lec.vibracion) : [],
        borderColor: '#00cc66',
        backgroundColor: 'rgba(0, 204, 102, 0.2)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'white' } } },
    scales: {
      y: { ticks: { color: 'gray' }, grid: { color: '#333' } },
      x: { ticks: { color: 'gray' }, grid: { display: false } }
    }
  };

  //RENDER
  return (
    <Layout>
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Monitoero del rendimiento de maquina en tiempo real</p>
        <button 
          onClick={() => setForzarFallo(!forzarFallo)}
          style={{
            marginTop: '10px',
            padding: '8px 15px',
            backgroundColor: forzarFallo ? '#ff4d4d' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {forzarFallo ? "Restaurar Máquina" : "Simular Fallo de Motor"}
        </button>
      </motion.div>

      {/*Alerta simulada de IA*/}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#00ffcc' }}>
          <Cpu className="animate-spin" size={32} />
          <p>Conectando con motor de Inteligencia Artificial...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ 
            backgroundColor: datosMaquina?.hay_anomalia_actual ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 204, 102, 0.1)', 
            border: `1px solid ${datosMaquina?.hay_anomalia_actual ? '#ff4d4d' : '#00cc66'}`,
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <AlertTriangle color={datosMaquina?.hay_anomalia_actual ? '#ff4d4d' : '#00cc66'} size={32} />
          <div>
            <h3 style={{ margin: 0, color: datosMaquina?.hay_anomalia_actual ? '#ff4d4d' : '#00cc66' }}>
              {datosMaquina?.hay_anomalia_actual ? "¡ALERTA IA CRÍTICA!" : "SISTEMA ESTABLE"}
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>
              {datosMaquina?.hay_anomalia_actual 
                ? `La IA ha detectado ${datosMaquina.alertas_ia.length} anomalías en la ${datosMaquina.maquina}. Requiere mantenimiento inmediato.`
                : `Los modelos predictivos indican operación normal para la ${datosMaquina.maquina}.`}
            </p>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="metrics-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
      >
        <MetricCard title="Total Trabajadores" value={dashboardMetrics.totalTrabajadores} icon={<Users size={24} />} trend={5} />
        <MetricCard title="Rendimiento Promedio" value={dashboardMetrics.promedioRendimiento} icon={<TrendingUp size={24} />} suffix="%" trend={-3} />
        <MetricCard title="Órdenes Activas" value={dashboardMetrics.ordenesActivas} icon={<FileText size={24} />} trend={12} />
        <MetricCard title="Eficiencia Global" value={dashboardMetrics.eficienciaGlobal} icon={<Activity size={24} />} suffix="%" trend={8} />
        
        {/* tarjeta modificada para datos SPI*/}
        <MetricCard 
          title="Temp. Actual Máquina" 
          value={datosMaquina ? `${datosMaquina.ultimas_lecturas[9].temperatura.toFixed(1)}°C` : '...'} 
          icon={<Cpu size={24} />} 
          trend={datosMaquina?.hay_anomalia_actual ? -100 : 0} 
        />
        <MetricCard title="Alertas Críticas" value={datosMaquina?.alertas_ia.length || 0} icon={<AlertTriangle size={24} />} trend={datosMaquina?.hay_anomalia_actual ? 100 : 0} />
      </motion.div>

      {/* grafico de maquina*/}
      <motion.div 
        className="chart-section" style={{ marginTop: '30px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card title="Telemetría en Tiempo Real" icon={<Activity size={20} />}>
          <div style={{ height: '300px', width: '100%', padding: '10px' }}>
            {!cargando && datosMaquina ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p>Cargando simulación...</p>
            )}
          </div>
        </Card>
      </motion.div>

      


<motion.div 
        style={{ marginTop: '30px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card title="Gemelo Digital 3D (Simulación en Vivo)" icon={<Activity size={20} />}>
           {/* Le pasamos el estado de la IA al modelo 3D */}
          <GemeloDigital hayAnomalia={datosMaquina?.hay_anomalia_actual} />
        </Card>
      </motion.div>

      

      <motion.div 
        className="dashboard-grid" style={{ marginTop: '30px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card title="Top 3 Trabajadores del Mes" icon={<Award size={20} />}>
          <Table columns={workerColumns} data={topPerformers} />
        </Card>
        <Card title="Órdenes de Trabajo Recientes" icon={<FileText size={20} />}>
          <Table columns={orderColumns} data={recentOrders} />
        </Card>
      </motion.div>
    </Layout>
  );
}