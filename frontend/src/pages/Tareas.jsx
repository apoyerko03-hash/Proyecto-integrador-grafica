import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

const EMPTY = { orden: '', nombre_tarea: '', unidad_medida: '', prod_esperada: '', tiempo_estimado_horas: '' };

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const fetchData = () => {
    Promise.all([api.get('/produccion/tareas/'), api.get('/produccion/ordenes/')])
      .then(([t, o]) => { setTareas(t.data); setOrdenes(o.data); setLoading(false); })
      .catch(console.error);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };
  const openEdit = (t) => {
    setForm({ orden: t.orden, nombre_tarea: t.nombre_tarea, unidad_medida: t.unidad_medida, prod_esperada: t.prod_esperada, tiempo_estimado_horas: t.tiempo_estimado_horas });
    setEditId(t.id); setShowModal(true);
  };
  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar tarea?')) return;
    api.delete(`/produccion/tareas/${id}/`).then(fetchData).catch(console.error);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const req = editId ? api.put(`/produccion/tareas/${editId}/`, form) : api.post('/produccion/tareas/', form);
    req.then(() => { fetchData(); setShowModal(false); }).catch(() => alert('Error'));
  };
  const ordenCodigo = (id) => ordenes.find(o => o.id === id)?.codigo || id;

  if (loading) return <Layout title="Tareas"><div className="loading">Cargando...</div></Layout>;

  return (
    <Layout title="Tareas" subtitle="Tareas por orden de trabajo">
      <div className="page-header">
        <div />
        <button className="btn-primary" onClick={openCreate}><Plus size={16} />Nueva</button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card overflow-hidden">
        <table className="dss-table">
          <thead>
            <tr><th>#</th><th>Orden</th><th>Tarea</th><th>Unidad</th><th>Prod. Esperada</th><th>Tiempo Est. (h)</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {tareas.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-white/30 py-10 font-mono text-xs">Sin tareas</td></tr>
            ) : tareas.map((t, i) => (
              <tr key={t.id}>
                <td className="text-white/30 font-mono text-xs w-10">{String(i + 1).padStart(2, '0')}</td>
                <td><span className="badge badge-info font-mono">{ordenCodigo(t.orden)}</span></td>
                <td className="font-medium text-white">{t.nombre_tarea}</td>
                <td className="text-white/60 text-xs font-mono">{t.unidad_medida}</td>
                <td className="text-accent-primary font-mono text-sm font-bold">{t.prod_esperada}</td>
                <td className="text-white/60 font-mono text-sm">{t.tiempo_estimado_horas}h</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(t)}><Pencil size={13} />Editar</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(t.id)}><Trash2 size={13} />Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Editar' : 'Nueva'} Tarea</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <select className="form-select" value={form.orden} onChange={e => setForm({ ...form, orden: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {ordenes.map(o => <option key={o.id} value={o.id}>{o.codigo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre Tarea</label>
                <input className="form-input" value={form.nombre_tarea} onChange={e => setForm({ ...form, nombre_tarea: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unidad Medida</label>
                <input className="form-input" value={form.unidad_medida} onChange={e => setForm({ ...form, unidad_medida: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Producción Esperada</label>
                  <input className="form-input" type="number" step="any" value={form.prod_esperada} onChange={e => setForm({ ...form, prod_esperada: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiempo Estimado (h)</label>
                  <input className="form-input" type="number" step="any" value={form.tiempo_estimado_horas} onChange={e => setForm({ ...form, tiempo_estimado_horas: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
