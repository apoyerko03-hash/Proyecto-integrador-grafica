export const mockWorkers = [
  { id: 1, nombre: 'Juan Pérez', cargo: 'Operario', area: 'Producción', rendimiento: 92, horasTrabajadas: 160, productividad: 95, estado: 'Activo' },
  { id: 2, nombre: 'María González', cargo: 'Soldadora', area: 'Soldadura', rendimiento: 88, horasTrabajadas: 152, productividad: 90, estado: 'Activo' },
  { id: 3, nombre: 'Carlos Ramírez', cargo: 'Tornero', area: 'Mecanizado', rendimiento: 65, horasTrabajadas: 145, productividad: 68, estado: 'Activo' },
  { id: 4, nombre: 'Ana Martínez', cargo: 'Supervisora', area: 'Control de Calidad', rendimiento: 95, horasTrabajadas: 160, productividad: 98, estado: 'Activo' },
  { id: 5, nombre: 'Pedro López', cargo: 'Operario', area: 'Producción', rendimiento: 78, horasTrabajadas: 148, productividad: 82, estado: 'Activo' },
  { id: 6, nombre: 'Laura Sánchez', cargo: 'Fresadora', area: 'Mecanizado', rendimiento: 58, horasTrabajadas: 120, productividad: 62, estado: 'Activo' },
];

export const mockProductionRecords = [
  { id: 1, trabajadorId: 1, trabajadorNombre: 'Juan Pérez', fecha: '2024-03-20', unidadesProducidas: 150, horasTrabajadas: 8, eficiencia: 94, turno: 'Mañana' },
  { id: 2, trabajadorId: 2, trabajadorNombre: 'María González', fecha: '2024-03-20', unidadesProducidas: 135, horasTrabajadas: 8, eficiencia: 89, turno: 'Mañana' },
  { id: 3, trabajadorId: 3, trabajadorNombre: 'Carlos Ramírez', fecha: '2024-03-20', unidadesProducidas: 98, horasTrabajadas: 8, eficiencia: 65, turno: 'Tarde' },
  { id: 4, trabajadorId: 5, trabajadorNombre: 'Pedro López', fecha: '2024-03-21', unidadesProducidas: 125, horasTrabajadas: 8, eficiencia: 81, turno: 'Mañana' },
  { id: 5, trabajadorId: 6, trabajadorNombre: 'Laura Sánchez', fecha: '2024-03-21', unidadesProducidas: 88, horasTrabajadas: 8, eficiencia: 60, turno: 'Noche' },
];

export const mockWorkOrders = [
  { id: 1, codigo: 'OT-2024-001', cliente: 'Constructora ABC', descripcion: 'Fabricación de vigas metálicas', fechaInicio: '2024-03-01', fechaEntrega: '2024-03-30', estado: 'En Proceso', prioridad: 'Alta', progreso: 75 },
  { id: 2, codigo: 'OT-2024-002', cliente: 'Industrias XYZ', descripcion: 'Piezas mecanizadas especiales', fechaInicio: '2024-03-05', fechaEntrega: '2024-03-25', estado: 'En Proceso', prioridad: 'Media', progreso: 60 },
  { id: 3, codigo: 'OT-2024-003', cliente: 'Minera del Sur', descripcion: 'Estructuras metálicas para maquinaria', fechaInicio: '2024-03-10', fechaEntrega: '2024-04-10', estado: 'Pendiente', prioridad: 'Baja', progreso: 15 },
  { id: 4, codigo: 'OT-2024-004', cliente: 'Automotriz Norte', descripcion: 'Componentes automotrices', fechaInicio: '2024-02-15', fechaEntrega: '2024-03-22', estado: 'Retrasada', prioridad: 'Alta', progreso: 45 },
  { id: 5, codigo: 'OT-2024-005', cliente: 'Constructora DEF', descripcion: 'Escaleras metálicas industriales', fechaInicio: '2024-02-20', fechaEntrega: '2024-03-18', estado: 'Completada', prioridad: 'Media', progreso: 100 },
];

export const mockAIAlerts = [
  { id: 1, tipo: 'danger', titulo: 'Bajo Rendimiento Detectado', mensaje: 'Carlos Ramírez ha mostrado un rendimiento del 65% en los últimos 30 días, por debajo del promedio esperado.', trabajadorId: 3, fecha: '2024-03-20' },
  { id: 2, tipo: 'danger', titulo: 'Productividad Crítica', mensaje: 'Laura Sánchez registra una productividad del 62%, requiere intervención inmediata.', trabajadorId: 6, fecha: '2024-03-21' },
  { id: 3, tipo: 'warning', titulo: 'Tendencia Descendente', mensaje: 'Pedro López muestra una tendencia descendente en su productividad en las últimas 2 semanas.', trabajadorId: 5, fecha: '2024-03-19' },
  { id: 4, tipo: 'info', titulo: 'Patrón Identificado', mensaje: 'El turno de noche muestra un 15% menos de eficiencia que otros turnos.', fecha: '2024-03-18' },
];

export const dashboardMetrics = {
  totalTrabajadores: 6,
  promedioRendimiento: 79.3,
  ordenesActivas: 3,
  eficienciaGlobal: 82.5,
  produccionMensual: 1250,
  alertasCriticas: 2,
};
