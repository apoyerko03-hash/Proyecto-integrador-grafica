import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Iconos para la interfaz de filtrado y alertas
import {
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';

// Componentes de Recharts para gráficos de líneas y barras
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Página dedicada al análisis detallado de la producción y detección de anomalías
const Analitica = () => {

  // Estados para los criterios de filtrado
  const [filtroTrabajador, setFiltroTrabajador] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Estados para los datos de la tabla y los gráficos
  const [registros, setRegistros] = useState([]);
  const [rendimientoData, setRendimientoData] = useState([]);

  const [loading, setLoading] = useState(true);

  // Hook para cargar los datos al iniciar la página
  useEffect(() => {

    const fetchData = async () => {

      try {
        // Datos de ejemplo que representan registros de producción reales
        const registrosSimulados = [
          {
            id: 1,
            trabajador: 'Carlos García',
            tarea: 'Soldadura',
            fecha: '2026-05-19',
            eficiencia: 92,
            tiempo: 45,
            es_anomalia: false,
          },
          {
            id: 2,
            trabajador: 'Maria López',
            tarea: 'Corte',
            fecha: '2026-05-19',
            eficiencia: 78,
            tiempo: 30,
            es_anomalia: true, // Marcado como anomalía para demostración
          },
          // ... otros registros
          {
            id: 3,
            trabajador: 'Juan Pérez',
            tarea: 'Ensamble',
            fecha: '2026-05-19',
            eficiencia: 88,
            tiempo: 60,
            es_anomalia: false,
          },
          {
            id: 4,
            trabajador: 'Carlos García',
            tarea: 'Soldadura',
            fecha: '2026-05-18',
            eficiencia: 95,
            tiempo: 43,
            es_anomalia: false,
          },
          {
            id: 5,
            trabajador: 'Ana Rodríguez',
            tarea: 'Pintura',
            fecha: '2026-05-18',
            eficiencia: 65,
            tiempo: 90,
            es_anomalia: true,
          },
        ];

        setRegistros(registrosSimulados);

        // Datos agregados por día para los gráficos de tendencia
        const rendimientoSimulado = [
          { fecha: '19-May', promedio: 88, anomalias: 2 },
          { fecha: '18-May', promedio: 85, anomalias: 1 },
          { fecha: '17-May', promedio: 92, anomalias: 0 },
          { fecha: '16-May', promedio: 89, anomalias: 1 },
          { fecha: '15-May', promedio: 86, anomalias: 2 },
        ];

        setRendimientoData(rendimientoSimulado);

      } catch (error) {

        console.error('Error fetching data:', error);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  // Lógica de filtrado en cliente para la tabla de registros
  const registrosFiltrados = registros.filter(
    (r) =>
      (filtroTrabajador === '' ||
        r.trabajador
          .toLowerCase()
          .includes(filtroTrabajador.toLowerCase())) &&
      (filtroFecha === '' || r.fecha === filtroFecha)
  );

  // Helper para identificar registros con problemas detectados por IA
  const registrosAnomalos =
    registrosFiltrados.filter((r) => r.es_anomalia);

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >

      {/* Título de la sección */}
      <div>

        <h2 className="text-3xl font-bold text-text-light mb-2">
          Analítica Avanzada
        </h2>

        <p className="text-text-secondary">
          Módulo DSS (Sistema de Soporte a Decisiones) potenciado con IA
        </p>

      </div>

      {/* Formulario de Filtros Interactivos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card"
      >

        <div className="flex items-center gap-2 mb-4">

          <Filter
            size={20}
            className="text-accent"
          />

          <h3 className="text-lg font-bold text-text-light">
            Filtros
          </h3>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <div>

            <label className="block text-sm font-medium text-text-secondary mb-2">
              Trabajador
            </label>

            <input
              type="text"
              value={filtroTrabajador}
              onChange={(e) =>
                setFiltroTrabajador(e.target.value)
              }
              placeholder="Buscar trabajador..."
              className="w-full bg-bg-dark border border-border-color rounded-lg px-3 py-2 text-black"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-text-secondary mb-2">
              Fecha
            </label>

            <input
              type="date"
              value={filtroFecha}
              onChange={(e) =>
                setFiltroFecha(e.target.value)
              }
              className="w-full bg-bg-dark border border-border-color rounded-lg px-3 py-2 text-black"
            />

          </div>

          <button
            className="col-span-1 md:col-span-2 lg:col-span-2 mt-6 bg-accent hover:bg-accent/90 text-bg-dark font-semibold py-2 px-4 rounded-lg transition"
          >
            Generar Reporte Detallado
          </button>

        </div>

      </motion.div>

      {/* Sección de Visualización Gráfica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Líneas: Evolución de la Eficiencia Promedio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card"
        >

          <h3 className="text-lg font-bold text-text-light mb-4">
            Rendimiento Diario
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <LineChart data={rendimientoData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />

              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.5)"
              />

              <YAxis
                stroke="rgba(255,255,255,0.5)"
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="promedio"
                stroke="#01c38e"
                name="Eficiencia Media (%)"
              />

            </LineChart>

          </ResponsiveContainer>

        </motion.div>

        {/* Gráfico de Barras: Volumen de Anomalías Detectadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card"
        >

          <h3 className="text-lg font-bold text-text-light mb-4">
            Anomalías Detectadas
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart data={rendimientoData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />

              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.5)"
              />

              <YAxis
                stroke="rgba(255,255,255,0.5)"
              />

              <Tooltip />

              <Bar
                dataKey="anomalias"
                fill="#ef4444"
                name="Nº de Anomalías"
              />

            </BarChart>

          </ResponsiveContainer>

        </motion.div>

      </div>

      {/* Tabla detallada de registros de producción */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card overflow-x-auto"
      >

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-lg font-bold text-text-light">
            Registros Históricos ({registrosFiltrados.length})
          </h3>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-lg"
          >
            <Download size={18} />
            Exportar CSV/PDF
          </button>

        </div>

        <table className="w-full text-sm">

          <thead>

            <tr className="border-b border-border-color text-text-secondary">

              <th className="text-left px-4 py-3 font-semibold">
                Trabajador
              </th>

              <th className="text-left px-4 py-3 font-semibold">
                Tarea Realizada
              </th>

              <th className="text-left px-4 py-3 font-semibold">
                Fecha
              </th>

              <th className="text-left px-4 py-3 font-semibold">
                Eficiencia
              </th>

              <th className="text-left px-4 py-3 font-semibold">
                Tiempo (m)
              </th>

              <th className="text-left px-4 py-3 font-semibold">
                Estado IA
              </th>

            </tr>

          </thead>

          <tbody>

            {registrosFiltrados.map((registro) => (

              <tr
                key={registro.id}
                className={`border-b border-border-color hover:bg-white/5 transition ${
                  registro.es_anomalia
                    ? 'bg-red-500/5'
                    : ''
                }`}
              >

                <td className="px-4 py-3 text-text-light">
                  {registro.trabajador}
                </td>

                <td className="px-4 py-3 text-text-secondary">
                  {registro.tarea}
                </td>

                <td className="px-4 py-3 text-text-secondary">
                  {registro.fecha}
                </td>

                <td className="px-4 py-3 font-medium">
                  <span className={registro.eficiencia < 80 ? 'text-orange-400' : 'text-green-400'}>
                    {registro.eficiencia}%
                  </span>
                </td>

                <td className="px-4 py-3 text-text-secondary">
                  {registro.tiempo}
                </td>

                <td className="px-4 py-3">

                  {registro.es_anomalia ? (

                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">

                      <AlertCircle size={14} />
                      Anomalía detectada

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
                      ✓ Funcionamiento Normal
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* Resumen de alertas si existen anomalías visibles */}
        {registrosAnomalos.length > 0 && (

          <div className="mt-4 p-4 bg-red-500/5 border border-red-500/30 rounded-lg">

            <p className="text-red-500 font-medium flex items-center gap-2">

              <AlertCircle size={18} />

              Atención: Se han detectado {registrosAnomalos.length} anomalía(s) que requieren revisión manual.

            </p>

          </div>

        )}

      </motion.div>

    </motion.div>

  );
};

export default Analitica;