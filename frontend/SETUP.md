# J.E.RKO Frontend - Dashboard Industrial DSS

Sistema de Soporte a Decisiones (DSS) profesional para gestión industrial integral.

## 🚀 Características

- **Dashboard Inteligente**: Visualización de KPIs en tiempo real con gráficas interactivas
- **Analítica Avanzada**: Módulo DSS con detección de anomalías por IA
- **Gemelo Digital**: Visualización de estaciones de trabajo en tiempo real
- **Autenticación JWT**: Sistema seguro de autenticación con token Bearer
- **Interfaz Minimalista**: Diseño profesional orientado a toma de decisiones gerenciales
- **Responsive**: Adaptable a todos los dispositivos

## 🛠️ Stack Tecnológico

- **Frontend Framework**: React 18 + Vite
- **Estilos**: Tailwind CSS + Custom CSS
- **Animaciones**: Framer Motion
- **Gráficas**: Recharts
- **Iconos**: Lucide React
- **HTTP Client**: Axios con interceptores
- **Enrutamiento**: React Router v6
- **Estado Global**: React Context API

## 📋 Requisitos

- Node.js 16+ 
- npm o yarn
- Backend J.E.RKO ejecutándose en `http://localhost:8000`

## ⚙️ Instalación

1. **Clonar el repositorio** (si aplica)
```bash
cd frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (si es necesario)
Editar `src/api/axiosConfig.js` para cambiar la URL del backend.

## 🏃 Ejecución

### Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Build Producción
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── api/                    # Servicios de API
│   └── axiosConfig.js      # Configuración de axios e interceptores
├── components/             # Componentes reutilizables
│   ├── KPICard.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   └── GemeloDigital.jsx
├── context/                # Context API para estado global
│   └── AuthContext.jsx
├── layouts/                # Layouts principales
│   └── MainLayout.jsx
├── pages/                  # Páginas principales
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Analitica.jsx
│   ├── Ordenes.jsx
│   ├── Trabajadores.jsx
│   └── Clientes.jsx
├── App.jsx                 # Rutas principales
├── main.jsx                # Punto de entrada
└── index.css               # Estilos globales
```

## 🎨 Paleta de Colores

- **Fondo**: `#1a1e29`
- **Tarjetas**: `#132d46`
- **Acento**: `#01c38e`
- **Texto**: `#ffffff`
- **Texto Secundario**: `#a0aec0`
- **Bordes**: `#2d3748`

## 🔐 Autenticación

El sistema utiliza JWT para autenticación. El token se almacena en `localStorage` y se envía automáticamente en el header `Authorization: Bearer <token>` en cada petición.

### Flujo de Autenticación
1. Usuario inicia sesión en `/login`
2. Backend devuelve `access_token` y datos del usuario
3. Token se almacena en localStorage
4. AuthContext verifica el token al cargar la app
5. Rutas protegidas requieren autenticación válida

## 📊 Módulos Principales

### Dashboard
Página de inicio con:
- KPIs principales (Órdenes, Eficiencia, Alertas, Trabajadores)
- Gráfico de rendimiento semanal
- Estado de anomalías
- Alertas recientes

### Analítica (DSS)
Módulo crítico con:
- Filtros por trabajador y fecha
- Gráficos de rendimiento y anomalías
- Tabla de registros de producción
- Resaltado automático de registros anómalos

### Gemelo Digital
Visualización interactiva de:
- Estaciones de trabajo activas
- Progreso en tiempo real
- Eficiencia de operarios
- Resumen de planta

### Órdenes
Gestión de:
- Órdenes de trabajo
- Progreso de tareas
- Fechas de entrega
- Estados de órdenes

### Trabajadores
Administración de:
- Perfil de trabajadores
- Eficiencia individual
- Histórico de registros
- Estado laboral

### Clientes
Base de datos de:
- Información de clientes
- Contactos principales
- Órdenes asociadas
- Estado de relación

## 🔌 APIs Integradas

El sistema se integra con los siguientes endpoints del backend:

```
POST   /api/usuarios/login/           - Iniciar sesión
GET    /api/usuarios/perfil/          - Obtener perfil del usuario
GET    /api/usuarios/trabajadores/    - Listar trabajadores
GET    /api/produccion/ordenes/       - Listar órdenes
GET    /api/produccion/tareas/        - Listar tareas
GET    /api/produccion/registros/     - Listar registros de producción
GET    /api/produccion/clientes/      - Listar clientes
GET    /api/analitica/metricas/       - Obtener métricas
GET    /api/analitica/rendimiento/    - Análisis de rendimiento
GET    /api/analitica/anomalias/      - Detección de anomalías
GET    /api/analitica/kpis/           - KPIs principales
```

## 🎯 Mejoras Futuras

- [ ] Exportación de reportes en PDF/Excel
- [ ] Gráficas 3D avanzadas con Three.js
- [ ] Dashboard personalizable
- [ ] Notificaciones en tiempo real con WebSocket
- [ ] Predicción de anomalías con ML
- [ ] Multi-idioma (i18n)
- [ ] Tema claro/oscuro configurable
- [ ] Pruebas unitarias e integración

## 🤝 Soporte

Para reportar bugs o solicitar funcionalidades, contactar al equipo de desarrollo.

## 📄 Licencia

Proyecto privado - J.E.RKO 2026
