import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axiosConfig';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/usuarios/roles/')
      .then(res => setRoles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Roles"><div className="loading">Cargando...</div></Layout>;

  return (
    <Layout title="Roles" subtitle="Roles del sistema">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card overflow-hidden">
        <table className="dss-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr><td colSpan={2} className="text-center text-white/30 py-10 font-mono text-xs">Sin roles registrados</td></tr>
            ) : roles.map((r, i) => (
              <tr key={r.id}>
                <td className="text-white/30 font-mono text-xs w-12">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                      <Award size={14} className="text-accent-primary" />
                    </div>
                    <span className="font-medium text-white">{r.nombre}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </Layout>
  );
}
