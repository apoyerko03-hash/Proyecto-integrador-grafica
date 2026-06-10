import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../api/axiosConfig';

export default function NotificationCenter() {
  const [anomalias, setAnomalias] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAnomalias = async () => {
    try {
      const res = await api.get('/api/analitica/anomalias/recientes/');
      setAnomalias(res.data);
    } catch (err) {
      console.error('Error fetching anomalias', err);
    }
  };

  useEffect(() => {
    fetchAnomalias();
    const interval = setInterval(fetchAnomalias, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRevisar = async (id) => {
    try {
      await api.post(`/api/analitica/anomalias/${id}/revisar/`);
      setAnomalias(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error revisando anomalia', err);
    }
  };

  return (
    <div className="relative">
      <button 
        className={`p-2 rounded-full transition-all ${anomalias.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {anomalias.length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0d1117] animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Centro de Mensajes</h3>
              <button onClick={() => setIsOpen(false)}><X size={14} className="text-white/40" /></button>
            </div>
            
            <div className="max-height-[400px] overflow-y-auto">
              {anomalias.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle size={32} className="mx-auto text-green-500/20 mb-2" />
                  <p className="text-white/30 text-xs">Todo bajo control</p>
                </div>
              ) : (
                anomalias.map(a => (
                  <div key={a.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-400 h-fit">
                        <AlertCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-xs font-semibold">{a.trabajador}</p>
                        <p className="text-white/50 text-[10px]">{a.tarea}</p>
                        <p className="text-red-400/80 text-[10px] mt-1 font-mono italic">"{a.detalle || 'Sin detalle'}"</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-white/20 text-[9px] font-mono">{a.fecha}</span>
                          <button 
                            onClick={() => handleRevisar(a.id)}
                            className="text-accent-primary hover:text-white text-[10px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle size={10} /> REVISADO
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
