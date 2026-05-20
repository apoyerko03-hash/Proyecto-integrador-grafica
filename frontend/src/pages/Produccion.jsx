import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { mockProductionRecords, mockWorkers } from '../data/mockData';

export default function Produccion() {
  const [records, setRecords] = useState(mockProductionRecords);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ trabajadorId: '', fecha: '', unidadesProducidas: '', horasTrabajadas: '', turno: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const worker = mockWorkers.find(w => w.id === parseInt(formData.trabajadorId));
    const newRecord = {
      id: records.length + 1,
      trabajadorId: parseInt(formData.trabajadorId),
      trabajadorNombre: worker?.nombre || '',
      fecha: formData.fecha,
      unidadesProducidas: parseInt(formData.unidadesProducidas),
      horasTrabajadas: parseInt(formData.horasTrabajadas),
      eficiencia: Math.round((parseInt(formData.unidadesProducidas) / parseInt(formData.horasTrabajadas)) * 0.6),
      turno: formData.turno,
    };
    setRecords([newRecord, ...records]);
    setFormData({ trabajadorId: '', fecha: '', unidadesProducidas: '', horasTrabajadas: '', turno: '' });
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const columns = [
    { header: 'Fecha', accessor: 'fecha' },
    { header: 'Trabajador', accessor: 'trabajadorNombre' },
    { header: 'Turno', accessor: 'turno' },
    { header: 'Unidades Producidas', accessor: 'unidadesProducidas' },
    { header: 'Horas Trabajadas', accessor: 'horasTrabajadas' },
    { header: 'Eficiencia', accessor: 'eficiencia', render: (v) => <span className={`badge ${v >= 80 ? 'badge-success' : v >= 60 ? 'badge-warning' : 'badge-danger'}`}>{v}%</span> },
  ];

  const totalUnidades = records.reduce((sum, r) => sum + r.unidadesProducidas, 0);
  const promedioEficiencia = Math.round(records.reduce((sum, r) => sum + r.eficiencia, 0) / records.length);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de Producción</h1>
          <p className="page-subtitle">Monitorea la producción diaria de tu planta</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary"><Plus size={20} className="mr-2" />Nuevo Registro</Button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{totalUnidades}</div><div className="stat-label">Unidades Totales</div></div>
        <div className="stat-card"><div className="stat-value">{promedioEficiencia}%</div><div className="stat-label">Eficiencia Promedio</div></div>
        <div className="stat-card"><div className="stat-value">{records.length}</div><div className="stat-label">Registros Totales</div></div>
      </div>

      {showForm && (
        <Card title="Registrar Producción" icon={<Calendar size={20} />}>
          <form onSubmit={handleSubmit} className="form-grid">
            <Select label="Trabajador" name="trabajadorId" value={formData.trabajadorId} onChange={handleChange} required options={mockWorkers.map(w => ({ value: w.id.toString(), label: w.nombre }))} />
            <Input label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
            <Input label="Unidades Producidas" name="unidadesProducidas" type="number" value={formData.unidadesProducidas} onChange={handleChange} required />
            <Input label="Horas Trabajadas" name="horasTrabajadas" type="number" value={formData.horasTrabajadas} onChange={handleChange} required />
            <Select label="Turno" name="turno" value={formData.turno} onChange={handleChange} required options={[{ value: 'Mañana', label: 'Mañana' }, { value: 'Tarde', label: 'Tarde' }, { value: 'Noche', label: 'Noche' }]} />
            <div className="form-actions">
              <Button type="submit" variant="primary">Guardar Registro</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Registros de Producción">
        <Table columns={columns} data={records} />
      </Card>
    </Layout>
  );
}
