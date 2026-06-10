import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axiosConfig';

const EMPTY = { orden: '', nombre_tarea: '', unidad_medida: '', prod_esperada: '', tiempo_estimado_horas: '' };

const isOrdenEnProceso = (orden) => {
  const estado = String(orden?.estado || '').trim().toLowerCase();
  return estado === 'en progreso' || estado === 'en_proceso';
};

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchData = () => {
    Promise.all([api.get('/api/produccion/tareas/'), api.get('/api/produccion/ordenes/')])
      .then(([t, o]) => { setTareas(t.data); setOrdenes(o.data); setLoading(false); })
      .catch(console.error);
  };
  useEffect(() => { fetchData(); }, []);

  const ordenesEnProceso = ordenes.filter(isOrdenEnProceso);

  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setMessage(
      ordenesEnProceso.length === 0
        ? 'No hay ordenes en proceso. Cambia una orden a En progreso antes de agregar tareas.'
        : ''
    );
    setShowModal(true);
  };
  const openEdit = (t) => {
    setForm({ orden: t.orden, nombre_tarea: t.nombre_tarea, unidad_medida: t.unidad_medida, prod_esperada: t.prod_esperada, tiempo_estimado_horas: t.tiempo_estimado_horas });
    setEditId(t.id); setMessage('La orden de una tarea existente no se cambia desde aqui.'); setShowModal(true);
  };
  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar tarea?')) return;
    api.delete(`/api/produccion/tareas/${id}/`).then(fetchData).catch(console.error);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editId && ordenesEnProceso.length === 0) {
      setMessage('No se puede crear la tarea porque no existe ninguna orden en estado En progreso.');
      return;
    }

    const req = editId ? api.put(`/api/produccion/tareas/${editId}/`, form) : api.post('/api/produccion/tareas/', form);
    req.then(() => { fetchData(); setShowModal(false); }).catch((error) => {
      const detalle = error.response?.data?.orden?.[0] || error.response?.data?.orden || 'No se pudo guardar la tarea.';
      setMessage(String(detalle));
    });
  };
  const ordenCodigo = (id) => ordenes.find(o => o.id === id)?.codigo || id;

  if (loading) return <Layout title="Tareas"><div className="loading">Cargando...</div></Layout>;

  return (
    <Layout title="Tareas" subtitle="Tareas por orden de trabajo">
      <div className="page-header">
        <div />
        <button className="btn-primary" onClick={openCreate}><Plus size={16} />Nueva</button>
      </div>

      {ordenesEnProceso.length === 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
          <AlertTriangle size={18} />
          Para agregar nuevas tareas, primero cambia una orden de trabajo a estado En progreso.
        </div>
      )}

<motion.div 
  initial={{ opacity: 0, y: 16 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ duration: 0.4 }} 
  className="w-full overflow-x-auto bg-transparent"
>
  <table className="w-full border-collapse text-left text-sm text-white">
    <thead>
      <tr className="border-b border-white">
        <th className="pb-4 font-semibold w-10">#</th>
        <th className="pb-4 font-semibold">Orden</th>
        <th className="pb-4 font-semibold">Tarea</th>
        <th className="pb-4 font-semibold">Unidad</th>
        <th className="pb-4 font-semibold text-right">Prod. Esperada</th>
        <th className="pb-4 font-semibold text-right">Tiempo Est. (h)</th>
        <th className="pb-4 font-semibold text-right pr-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {tareas.length === 0 ? (
        <tr className="border-b border-white/10">
          <td colSpan={7} className="text-center text-white/30 py-12 font-mono text-xs tracking-wider">
            Sin tareas disponibles
          </td>
        </tr>
      ) : (
        tareas.map((t, i) => (
          <tr key={t.id} className="border-b border-white/10 hover:bg-white/[0.02] transition-colors duration-150">
            {/* # */}
            <td className="py-4 text-white/30 font-mono text-xs">
              {String(i + 1).padStart(2, '0')}
            </td>
            {/* Orden */}
            <td className="py-4">
              <span className="inline-block border border-white/30 text-white px-2 py-0.5 font-mono text-xs tracking-tight rounded-sm">
                {ordenCodigo(t.orden)}
              </span>
            </td>
            {/* Tarea */}
            <td className="py-4 font-medium text-white max-w-xs truncate">
              {t.nombre_tarea}
            </td>
            {/* Unidad */}
            <td className="py-4 text-white/50 text-xs font-mono">
              {t.unidad_medida}
            </td>
            {/* Prod. Esperada */}
            <td className="py-4 text-right font-mono text-sm font-semibold text-white">
              {t.prod_esperada}
            </td>
            {/* Tiempo Est. */}
            <td className="py-4 text-right font-mono text-sm text-white/70">
              {t.tiempo_estimado_horas}h
            </td>
            {/* Acciones */}
            <td className="py-4">
              <div className="flex items-center justify-end gap-3 pr-2">
                <button 
                  className="flex items-center gap-1 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/60 px-2 py-1 rounded-sm transition-all duration-150" 
                  onClick={() => openEdit(t)}
                >
                  <Pencil size={12} />
                  <span>Editar</span>
                </button>
                <button 
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white border border-transparent hover:border-white/40 px-2 py-1 rounded-sm transition-all duration-150" 
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 size={12} />
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</motion.div>

     {showModal && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
    onClick={() => setShowModal(false)}
  >
    <motion.div 
      className="w-full max-w-lg bg-[#0a0a0a] border border-white p-6 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.15)] text-white"
      onClick={e => e.stopPropagation()} 
      initial={{ opacity: 0, scale: 0.95, y: 16 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {editId ? 'Editar' : 'Nueva'} Tarea
          </h2>
          <p className="text-xs text-white/50 font-mono mt-0.5">
            {editId ? 'Modifica los parámetros de la tarea' : 'Ingresa los detalles para la nueva orden'}
          </p>
        </div>
        <button 
          className="text-white/40 hover:text-white text-xl font-light w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-150" 
          onClick={() => setShowModal(false)}
        >
          ×
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de Orden */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/70 tracking-wide">Orden</label>
          {message && (
            <div className="mb-2 rounded-lg border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100">
              {message}
            </div>
          )}
          <div className="relative">
            <select 
              className="w-full bg-white/[0.03] border border-white/20 focus:border-white text-sm px-3 py-2.5 rounded-xl font-mono text-white outline-none transition-all duration-150 focus:ring-1 focus:ring-white appearance-none cursor-pointer" 
              value={form.orden} 
              onChange={e => setForm({ ...form, orden: e.target.value })} 
              required
              disabled={Boolean(editId) || (!editId && ordenesEnProceso.length === 0)}
            >
              <option value="" className="bg-[#0a0a0a] text-white/40">Seleccionar...</option>
              {(editId ? ordenes.filter(o => Number(o.id) === Number(form.orden)) : ordenesEnProceso).map(o => (
                <option key={o.id} value={o.id} className="bg-[#0a0a0a] text-white font-mono">
                  {o.codigo}{o.estado !== 'En progreso' ? ` - ${o.estado}` : ''}
                </option>
              ))}
            </select>
            {/* Flecha personalizada minimalista para el select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/40">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Nombre Tarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/70 tracking-wide">Nombre Tarea</label>
          <input 
            className="w-full bg-white/[0.03] border border-white/20 focus:border-white text-sm px-3 py-2.5 rounded-xl text-white placeholder:text-white/20 outline-none transition-all duration-150 focus:ring-1 focus:ring-white" 
            value={form.nombre_tarea} 
            onChange={e => setForm({ ...form, nombre_tarea: e.target.value })} 
            placeholder="Descripción del trabajo..."
            required 
          />
        </div>

        {/* Unidad Medida */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/70 tracking-wide">Unidad Medida</label>
          <input 
            className="w-full bg-white/[0.03] border border-white/20 focus:border-white text-sm px-3 py-2.5 rounded-xl font-mono text-white placeholder:text-white/20 outline-none transition-all duration-150 focus:ring-1 focus:ring-white" 
            value={form.unidad_medida} 
            onChange={e => setForm({ ...form, unidad_medida: e.target.value })} 
            placeholder="Ej. m², pza, kg"
            required 
          />
        </div>

        {/* Producción y Tiempo en cuadrícula */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/70 tracking-wide">Producción Esperada</label>
            <input 
              className="w-full bg-white/[0.03] border border-white/20 focus:border-white text-sm px-3 py-2.5 rounded-xl font-mono text-white placeholder:text-white/20 outline-none transition-all duration-150 focus:ring-1 focus:ring-white" 
              type="number" 
              step="any" 
              value={form.prod_esperada} 
              onChange={e => setForm({ ...form, prod_esperada: e.target.value })} 
              placeholder="0"
              required 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/70 tracking-wide">Tiempo Estimado (h)</label>
            <input 
              className="w-full bg-white/[0.03] border border-white/20 focus:border-white text-sm px-3 py-2.5 rounded-xl font-mono text-white placeholder:text-white/20 outline-none transition-all duration-150 focus:ring-1 focus:ring-white" 
              type="number" 
              step="any" 
              value={form.tiempo_estimado_horas} 
              onChange={e => setForm({ ...form, tiempo_estimado_horas: e.target.value })} 
              placeholder="0.0"
              required 
            />
          </div>
        </div>

        {/* Acciones (Footer) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
          <button 
            type="button" 
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-150" 
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={!editId && ordenesEnProceso.length === 0}
            className="bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 shadow-lg shadow-white/5"
          >
            Guardar
          </button>
        </div>
      </form>
    </motion.div>
  </div>
)}

    </Layout>
  );
}
