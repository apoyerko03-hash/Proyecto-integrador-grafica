import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { mockWorkers } from '../data/mockData';

export default function Trabajadores() {
  const [workers, setWorkers] = useState(mockWorkers);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ nombre: '', cargo: '', area: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setWorkers([...workers, { id: workers.length + 1, ...formData, rendimiento: 0, horasTrabajadas: 0, productividad: 0, estado: 'Activo' }]);
    setFormData({ nombre: '', cargo: '', area: '' });
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const filtered = workers.filter(w =>
    w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Cargo', accessor: 'cargo' },
    { header: 'Área', accessor: 'area' },
    { header: 'Rendimiento', accessor: 'rendimiento', render: (v) => <span className={`badge ${v >= 80 ? 'badge-success' : v >= 60 ? 'badge-warning' : 'badge-danger'}`}>{v}%</span> },
    { header: 'Horas Trabajadas', accessor: 'horasTrabajadas' },
    { header: 'Productividad', accessor: 'productividad', render: (v) => `${v}%` },
    { header: 'Estado', accessor: 'estado', render: (v) => <span className={`badge ${v === 'Activo' ? 'badge-success' : 'badge-gray'}`}>{v}</span> },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Trabajadores</h1>
          <p className="page-subtitle">Administra la información de tu personal</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary"><Plus size={20} className="mr-2" />Nuevo Trabajador</Button>
      </div>

      {showForm && (
        <Card title="Registrar Nuevo Trabajador">
          <form onSubmit={handleSubmit} className="form-grid">
            <Input label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleChange} required />
            <Input label="Cargo" name="cargo" value={formData.cargo} onChange={handleChange} required />
            <Select label="Área" name="area" value={formData.area} onChange={handleChange} required
              options={[
                { value: 'Producción', label: 'Producción' },
                { value: 'Soldadura', label: 'Soldadura' },
                { value: 'Mecanizado', label: 'Mecanizado' },
                { value: 'Control de Calidad', label: 'Control de Calidad' },
                { value: 'Mantenimiento', label: 'Mantenimiento' },
              ]}
            />
            <div className="form-actions">
              <Button type="submit" variant="primary">Guardar</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="search-container">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Buscar trabajador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
        </div>
        <Table columns={columns} data={filtered} />
      </Card>
    </Layout>
  );
}
