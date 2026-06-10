import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axiosConfig';

const EMPTY = { trabajador: '', tarea: '', cant_producida: '', tiempo_real_horas: '', fecha_registro: '' };

const formatNumber = (value) => {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? number : number.toFixed(2);
};

const formatDate = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';

  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const fetchData = () => {
    setLoading(true);

    Promise.all([
      api.get('/api/produccion/registros/'),
      api.get('/api/usuarios/trabajadores/'),
      api.get('/api/produccion/tareas/'),
    ])
      .then(([r, t, ta]) => {
        setRegistros(Array.isArray(r.data) ? r.data : []);
        setTrabajadores(Array.isArray(t.data) ? t.data : []);
        setTareas(Array.isArray(ta.data) ? ta.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Eliminar registro?')) return;
    api.delete(`/api/produccion/registros/${id}/`).then(fetchData).catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      trabajador: Number(form.trabajador),
      tarea: Number(form.tarea),
      cant_producida: Number(form.cant_producida),
      tiempo_real_horas: Number(form.tiempo_real_horas),
    };

    if (form.fecha_registro) {
      payload.fecha_registro = new Date(`${form.fecha_registro}T12:00:00`).toISOString();
    }

    api.post('/api/produccion/registros/', payload)
      .then(() => {
        fetchData();
        setShowModal(false);
      })
      .catch((error) => {
        console.error('Error guardando registro:', error.response?.data || error);
        alert(JSON.stringify(error.response?.data || 'Error al guardar el registro'));
      });
  };

  const nombreTrabajador = (dato) => {
    if (typeof dato === 'object' && dato?.nombre_completo) return dato.nombre_completo;
    if (typeof dato === 'object' && (dato?.nombres || dato?.apellidos)) {
      return `${dato.nombres || ''} ${dato.apellidos || ''}`.trim();
    }

    const id = typeof dato === 'object' ? dato.id : dato;
    const trabajador = trabajadores.find((item) => Number(item.id) === Number(id));
    return trabajador ? `${trabajador.nombres} ${trabajador.apellidos}` : 'Desconocido';
  };

  const nombreTarea = (dato) => {
    if (typeof dato === 'object' && dato?.nombre_tarea) return dato.nombre_tarea;

    const id = typeof dato === 'object' ? dato.id : dato;
    const tarea = tareas.find((item) => Number(item.id) === Number(id));
    return tarea ? tarea.nombre_tarea : 'Tarea no encontrada';
  };

  if (loading) {
    return (
      <Layout title="Registros">
        <div className="p-10 text-center text-white">Cargando datos...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Registros de Produccion" subtitle="Actividad por trabajador">
      <div className="mb-6 flex items-center justify-between">
        <div />
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => { setForm(EMPTY); setShowModal(true); }}
        >
          <Plus size={16} /> Nuevo Registro
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card overflow-hidden border border-white/10 bg-[#132d46]"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[#1a1e29]/70 text-[11px] uppercase tracking-widest text-white/45">
                <th className="w-16 px-5 py-4 text-left font-bold">#</th>
                <th className="px-5 py-4 text-left font-bold">Trabajador</th>
                <th className="px-5 py-4 text-left font-bold">Tarea</th>
                <th className="px-5 py-4 text-right font-bold">Cant. Producida</th>
                <th className="px-5 py-4 text-right font-bold">Tiempo Real (h)</th>
                <th className="px-5 py-4 text-center font-bold">Estado</th>
                <th className="px-5 py-4 text-left font-bold">Fecha</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center font-mono text-xs text-white/30">
                    Sin registros disponibles
                  </td>
                </tr>
              ) : registros.map((registro, index) => (
                <tr key={registro.id} className="group transition hover:bg-white/[0.035]">
                  <td className="border-t border-white/5 px-5 py-4 align-middle">
                    <span className="font-mono text-xs text-white/30">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 align-middle">
                    <p className="max-w-[240px] truncate text-sm font-semibold text-white">
                      {registro.trabajador_nombre || nombreTrabajador(registro.trabajador)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-white/30">
                      Registro #{registro.id}
                    </p>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 align-middle">
                    <span className="inline-flex max-w-[220px] items-center rounded-md border border-white/10 bg-[#1a1e29] px-3 py-1.5 text-xs font-medium text-white/70">
                      <span className="truncate">{nombreTarea(registro.tarea)}</span>
                    </span>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 text-right align-middle">
                    <span className="font-mono text-sm font-black text-accent-primary">
                      {formatNumber(registro.cant_producida)}
                    </span>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 text-right align-middle">
                    <span className="rounded-md bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-white/70">
                      {formatNumber(registro.tiempo_real_horas)} h
                    </span>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 text-center align-middle">
                    <span className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide ${
                      registro.es_anomalia
                        ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25'
                        : 'bg-[#01c38e]/15 text-[#01c38e] ring-1 ring-[#01c38e]/20'
                    }`}>
                      {registro.es_anomalia ? 'Anomalia' : 'Normal'}
                    </span>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 align-middle">
                    <span className="font-mono text-xs text-white/45">
                      {formatDate(registro.fecha_registro)}
                    </span>
                  </td>

                  <td className="border-t border-white/5 px-5 py-4 text-right align-middle">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
                      onClick={() => handleDelete(registro.id)}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showModal && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="modal w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-white">Nuevo Registro de Produccion</h3>
              <button className="text-white/50 hover:text-white" onClick={() => setShowModal(false)}>x</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="mb-1 block text-xs text-white">Trabajador</label>
                <select
                  className="form-select w-full rounded border border-white/10 bg-white p-2 text-black"
                  value={form.trabajador}
                  onChange={(e) => setForm({ ...form, trabajador: e.target.value })}
                  required
                >
                  <option value="">Seleccionar trabajador...</option>
                  {trabajadores.map((trabajador) => (
                    <option key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombres} {trabajador.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="mb-1 block text-xs text-white">Tarea</label>
                <select
                  className="form-select w-full rounded border border-white/10 bg-white p-2 text-black"
                  value={form.tarea}
                  onChange={(e) => setForm({ ...form, tarea: e.target.value })}
                  required
                >
                  <option value="">Seleccionar tarea...</option>
                  {tareas.map((tarea) => (
                    <option key={tarea.id} value={tarea.id}>
                      {tarea.nombre_tarea}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Cantidad</label>
                  <input
                    className="form-input w-full rounded border border-white/10 bg-black/20 p-2 text-white"
                    type="number"
                    step="any"
                    value={form.cant_producida}
                    onChange={(e) => setForm({ ...form, cant_producida: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/50">Horas</label>
                  <input
                    className="form-input w-full rounded border border-white/10 bg-black/20 p-2 text-white"
                    type="number"
                    step="any"
                    value={form.tiempo_real_horas}
                    onChange={(e) => setForm({ ...form, tiempo_real_horas: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/50">Fecha del registro</label>
                <input
                  className="form-input w-full rounded border border-white/10 bg-black/20 p-2 text-white"
                  type="date"
                  value={form.fecha_registro}
                  onChange={(e) => setForm({ ...form, fecha_registro: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-white/35">
                  Si lo dejas vacio, se usara la fecha actual.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-white/50 hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-blue-500"
                >
                  Guardar Datos
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
