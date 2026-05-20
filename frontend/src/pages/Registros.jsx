import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

const EMPTY = { trabajador: '', tarea: '', jefe_planta: '', cant_producida: '', tiempo_real_horas: '' };

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const fetchData = () => {
    Promise.all([
      api.get('/produccion/registros/'), 
      api.get('/usuarios/trabajadores/'), 
      api.get('/produccion/tareas/')
    ])
      .then(([r, t, ta]) => { 
        setRegistros(r.data); 
        setTrabajadores(t.data); 
        setTareas(ta.data); 
        setLoading(false); 
      })
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar registro?')) return;
    api.delete(`/produccion/registros/${id}/`).then(fetchData).catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/produccion/registros/', form)
      .then(() => { fetchData(); setShowModal(false); })
      .catch(() => alert('Error al guardar el registro'));
  };

  // --- CORRECCIÓN AQUÍ: Manejo de objetos o IDs ---
  const nombreTrabajador = (dato) => {
    const id = typeof dato === 'object' ? dato.id : dato;
    const t = trabajadores.find(item => item.id === id);
    return t ? `${t.nombres} ${t.apellidos}` : 'Desconocido';
  };

  const nombreTarea = (dato) => {
    const id = typeof dato === 'object' ? dato.id : dato;
    const t = tareas.find(item => item.id === id);
    return t ? t.nombre_tarea : 'Tarea no encontrada';
  };
  // ----------------------------------------------

  if (loading) return <Layout title="Registros"><div className="p-10 text-center text-white">Cargando datos...</div></Layout>;

  return (
    <Layout title="Registros de Producción" subtitle="Actividad por trabajador">
      <div className="flex justify-between items-center mb-6">
        <div />
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm(EMPTY); setShowModal(true); }}>
          <Plus size={16} /> Nuevo Registro
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card overflow-hidden">
        <table className="dss-table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Trabajador</th>
              <th>Tarea</th>
              <th>Cant. Producida</th>
              <th>Tiempo Real (h)</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-white/30 py-10 font-mono text-xs">Sin registros disponibles</td></tr>
            ) : registros.map((r, i) => (
              <tr key={r.id}>
                <td className="text-white/30 font-mono text-xs w-10">{String(i + 1).padStart(2, '0')}</td>
                <td className="font-medium text-white text-sm">{nombreTrabajador(r.trabajador)}</td>
                <td className="text-white/60 text-xs">{nombreTarea(r.tarea)}</td>
                <td className="text-accent-primary font-mono font-bold">{r.cant_producida}</td>
                <td className="text-white/60 font-mono text-sm">{r.tiempo_real_horas}h</td>
                <td>
                  <span className={`badge ${r.es_anomalia ? 'badge-danger' : 'badge-success'}`}>
                    {r.es_anomalia ? '⚠ Anomalía' : '✓ Normal'}
                  </span>
                </td>
                <td className="text-white/40 font-mono text-xs">
                  {r.fecha_registro ? new Date(r.fecha_registro).toLocaleDateString() : '---'}
                </td>
                <td>
                  <button className="btn-danger btn-sm flex items-center gap-1" onClick={() => handleDelete(r.id)}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowModal(false)}>
          <motion.div className="modal bg-[#1a1a1a] p-6 rounded-xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Nuevo Registro de Producción</h3>
              <button className="text-white/50 hover:text-white" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="block text-xs text-white/50 mb-1">Trabajador</label>
                <select className="form-select w-full bg-black/20 border border-white/10 p-2 text-white rounded" value={form.trabajador} onChange={e => setForm({ ...form, trabajador: e.target.value })} required>
                  <option value="">Seleccionar trabajador...</option>
                  {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="block text-xs text-white/50 mb-1">Tarea</label>
                <select className="form-select w-full bg-black/20 border border-white/10 p-2 text-white rounded" value={form.tarea} onChange={e => setForm({ ...form, tarea: e.target.value })} required>
                  <option value="">Seleccionar tarea...</option>
                  {tareas.map(t => <option key={t.id} value={t.id}>{t.nombre_tarea}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Cantidad</label>
                  <input className="form-input w-full bg-black/20 border border-white/10 p-2 text-white rounded" type="number" step="any" value={form.cant_producida} onChange={e => setForm({ ...form, cant_producida: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Horas</label>
                  <input className="form-input w-full bg-black/20 border border-white/10 p-2 text-white rounded" type="number" step="any" value={form.tiempo_real_horas} onChange={e => setForm({ ...form, tiempo_real_horas: e.target.value })} required />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 text-white/50 hover:text-white" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow-lg transition-colors">Guardar Datos</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}