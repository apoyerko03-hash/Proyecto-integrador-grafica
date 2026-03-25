import { Users, TrendingUp, FileText, Activity, AlertTriangle, Award } from 'lucide-react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import Card from '../components/Card';
import Table from '../components/Table';
import { dashboardMetrics, mockWorkers, mockWorkOrders } from '../data/mockData';

export default function Dashboard() {
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

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Vista general del rendimiento de la planta</p>
      </div>
      <div className="metrics-grid">
        <MetricCard title="Total Trabajadores" value={dashboardMetrics.totalTrabajadores} icon={<Users size={24} />} trend={5} />
        <MetricCard title="Rendimiento Promedio" value={dashboardMetrics.promedioRendimiento} icon={<TrendingUp size={24} />} suffix="%" trend={-3} />
        <MetricCard title="Órdenes Activas" value={dashboardMetrics.ordenesActivas} icon={<FileText size={24} />} trend={12} />
        <MetricCard title="Eficiencia Global" value={dashboardMetrics.eficienciaGlobal} icon={<Activity size={24} />} suffix="%" trend={8} />
        <MetricCard title="Producción Mensual" value={dashboardMetrics.produccionMensual} icon={<Award size={24} />} suffix=" unidades" trend={15} />
        <MetricCard title="Alertas Críticas" value={dashboardMetrics.alertasCriticas} icon={<AlertTriangle size={24} />} trend={-25} />
      </div>
      <div className="dashboard-grid">
        <Card title="Top 3 Trabajadores del Mes" icon={<Award size={20} />}>
          <Table columns={workerColumns} data={topPerformers} />
        </Card>
        <Card title="Órdenes de Trabajo Recientes" icon={<FileText size={20} />}>
          <Table columns={orderColumns} data={recentOrders} />
        </Card>
      </div>
      <div className="chart-section">
        <Card title="Rendimiento por Área" icon={<TrendingUp size={20} />}>
          <div className="chart-placeholder">
            <div className="chart-bar" style={{ height: '85%' }}><span className="chart-label">Producción</span><span className="chart-value">85%</span></div>
            <div className="chart-bar" style={{ height: '72%' }}><span className="chart-label">Soldadura</span><span className="chart-value">72%</span></div>
            <div className="chart-bar" style={{ height: '68%' }}><span className="chart-label">Mecanizado</span><span className="chart-value">68%</span></div>
            <div className="chart-bar" style={{ height: '92%' }}><span className="chart-label">Calidad</span><span className="chart-value">92%</span></div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
