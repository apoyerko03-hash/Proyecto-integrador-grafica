import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { mockWorkOrders } from '../data/mockData';

export default function Ordenes() {
  const [orders, setOrders] = useState(mockWorkOrders);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({ cliente: '', descripcion: '', fechaInicio: '', fechaEntrega: '', prioridad: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrders([{ id: orders.length + 1, codigo: `OT-2024-${String(orders.length + 1).padStart(3, '0')}`, ...formData, estado: 'Pendiente', progreso: 0 }, ...orders]);
    setFormData({ cliente: '', descripcion: '', fechaInicio: '', fechaEntrega: '', prioridad: '' });
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.estado === filterStatus);

  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Cliente', accessor: 'cliente' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Fecha Inicio', accessor: 'fechaInicio' },
    { header: 'Fecha Entrega', accessor: 'fechaEntrega' },
    { header: 'Prioridad', accessor: 'prioridad', render: (v) => { const c = { Alta: 'badge-danger', Media: 'badge-warning', Baja: 'badge-info' }; return <span className={`badge ${c[v]}`}>{v}</span>; } },
    { header: 'Estado', accessor: 'estado', render: (v) => { const c = { 'En Proceso': 'badge-info', Completada: 'badge-success', Pendiente: 'badge-warning', Retrasada: 'badge-danger' }; return <span className={`badge ${c[v]}`}>{v}</span>; } },
    { header: 'Progreso', accessor: 'progreso', render: (v) => <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${v}%` }}>{v}%</div></div> },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Órdenes de Trabajo</h1>
          <p className="page-subtitle">Gestiona las órdenes de producción</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary"><Plus size={20} className="mr-2" />Nueva Orden</Button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{orders.filter(o => o.estado === 'En Proceso').length}</div><div className="stat-label">En Proceso</div></div>
        <div className="stat-card"><div className="stat-value">{orders.filter(o => o.estado === 'Pendiente').length}</div><div className="stat-label">Pendientes</div></div>
        <div className="stat-card"><div className="stat-value">{orders.filter(o => o.estado === 'Completada').length}</div><div className="stat-label">Completadas</div></div>
        <div className="stat-card"><div className="stat-value">{orders.filter(o => o.estado === 'Retrasada').length}</div><div className="stat-label">Retrasadas</div></div>
      </div>

      {showForm && (
        <Card title="Nueva Orden de Trabajo">
          <form onSubmit={handleSubmit} className="form-grid">
            <Input label="Cliente" name="cliente" value={formData.cliente} onChange={handleChange} required />
            <Input label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
            <Input label="Fecha de Inicio" name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} required />
            <Input label="Fecha de Entrega" name="fechaEntrega" type="date" value={formData.fechaEntrega} onChange={handleChange} required />
            <Select label="Prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange} required options={[{ value: 'Alta', label: 'Alta' }, { value: 'Media', label: 'Media' }, { value: 'Baja', label: 'Baja' }]} />
            <div className="form-actions">
              <Button type="submit" variant="primary">Crear Orden</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="filter-container">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">Todas las Órdenes</option>
            <option value="Pendiente">Pendientes</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completadas</option>
            <option value="Retrasada">Retrasadas</option>
          </select>
        </div>
        <Table columns={columns} data={filtered} />
      </Card>
    </Layout>
  );
}
