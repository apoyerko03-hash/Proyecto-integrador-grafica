import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import api from '../api/axiosConfig';

export default function WorkerStats({ trabajadorId, nombres }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trabajadorId) return;
    setLoading(true);
    api.get(`/api/analitica/historico/?trabajador_id=${trabajadorId}&rango=mes`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [trabajadorId]);

  const anomaliasCount = data.filter(d => d.es_anomalia).length;
  const riesgo = anomaliasCount > 2 ? 'ALTO' : anomaliasCount > 0 ? 'MEDIO' : 'BAJO';
  const riesgoColor = riesgo === 'ALTO' ? 'text-red-500' : riesgo === 'MEDIO' ? 'text-yellow-500' : 'text-green-500';

  if (loading) return <div className="p-10 text-center font-mono text-white/20 text-xs">Analizando datos históricos...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase">Eficiencia Promedio</p>
            <p className="text-white font-bold text-xl">
              {(data.reduce((acc, curr) => acc + curr.eficiencia, 0) / (data.length || 1)).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${riesgoColor}`}>
            {riesgo === 'BAJO' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase">Nivel de Riesgo (IA)</p>
            <p className={`font-bold text-xl ${riesgoColor}`}>{riesgo}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase">Total Anomalías</p>
            <p className="text-white font-bold text-xl">{anomaliasCount}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-white font-semibold text-sm mb-6 flex items-center gap-2">
          <Activity size={16} className="text-accent-primary" />
          Rendimiento Histórico - {nombres}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#01c38e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#01c38e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="#ffffff40" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff40" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#01c38e' }}
              />
              <Area 
                type="monotone" 
                dataKey="eficiencia" 
                stroke="#01c38e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEf)" 
              />
              <Line 
                type="monotone" 
                dataKey="cant_producida" 
                stroke="#3b82f6" 
                strokeDasharray="5 5" 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
