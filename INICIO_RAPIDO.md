# 🚀 GUÍA RÁPIDA DE EJECUCIÓN - J.E.RKO Frontend

## ✅ Reconstrucción Completada

Tu frontend ha sido **completamente reconstruido** como un Dashboard Industrial profesional DSS (Decision Support System).

## 📦 Próximos Pasos

### 1️⃣ Instalar Dependencias
```bash
cd frontend
npm install
```

### 2️⃣ Iniciar en Desarrollo
```bash
npm run dev
```

Accede a: **http://localhost:5173**

### 3️⃣ Credenciales de Prueba
Usa las credenciales que tengas configuradas en tu backend Django.

---

## 📋 Archivos Generados/Modificados

### Configuración
- ✅ `package.json` - Migrado a Vite con todas las dependencias
- ✅ `vite.config.js` - Configuración completa de Vite
- ✅ `tailwind.config.js` - Paleta de colores personalizada
- ✅ `postcss.config.js` - Post-procesamiento CSS
- ✅ `public/index.html` - HTML adaptado para Vite
- ✅ `main.jsx` - Punto de entrada React

### Core
- ✅ `App.jsx` - Rutas principales con protección
- ✅ `index.css` - Estilos globales Tailwind
- ✅ `App.css` - Estilos personalizados

### Autenticación
- ✅ `context/AuthContext.jsx` - Context global con JWT
- ✅ `api/axiosConfig.js` - Axios con interceptores Bearer

### Layouts
- ✅ `layouts/MainLayout.jsx` - Layout principal con Sidebar + Navbar

### Componentes
- ✅ `components/ProtectedRoute.jsx` - Rutas protegidas
- ✅ `components/Navbar.jsx` - Barra superior profesional
- ✅ `components/Sidebar.jsx` - Sidebar colapsable
- ✅ `components/KPICard.jsx` - Tarjetas de métricas
- ✅ `components/GemeloDigital.jsx` - Visualización de estaciones

### Páginas
- ✅ `pages/Login.jsx` - Pantalla de autenticación minimalista
- ✅ `pages/Dashboard.jsx` - KPIs + Gráficos + Alertas
- ✅ `pages/Analitica.jsx` - DSS con detección de anomalías
- ✅ `pages/Ordenes.jsx` - Gestión de órdenes
- ✅ `pages/Trabajadores.jsx` - Gestión de personal
- ✅ `pages/Clientes.jsx` - Base de datos de clientes

---

## 🎨 Diseño Visual

### Paleta de Colores
```
Fondo:              #1a1e29  (Gris muy oscuro)
Tarjetas:           #132d46  (Azul oscuro)
Acento:             #01c38e  (Verde esmeralda)
Texto Principal:    #ffffff  (Blanco)
Texto Secundario:   #a0aec0  (Gris azulado)
Bordes:             #2d3748  (Gris oscuro)
```

### Características de Diseño
✅ Minimalista y profesional
✅ Orientado a decisiones gerenciales
✅ Animaciones suaves con Framer Motion
✅ Gráficas interactivas con Recharts
✅ Responsive en todos los dispositivos
✅ Dark mode optimizado para largas sesiones

---

## 🔌 Integración Backend

### Variables de Conexión
El backend debe estar ejecutándose en: **http://localhost:8000**

Editar si es necesario en: `src/api/axiosConfig.js`
```javascript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',  // ← Cambiar aquí
  ...
})
```

### Endpoints Esperados
```
POST   /api/usuarios/login/
GET    /api/usuarios/perfil/
GET    /api/usuarios/trabajadores/
GET    /api/produccion/ordenes/
GET    /api/produccion/registros/
GET    /api/analitica/rendimiento/
```

---

## ⚡ Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor Vite en http://localhost:5173

# Producción
npm run build        # Build optimizado para producción
npm run preview      # Preview local del build

# Análisis
npm run lint         # Eslint (si se configura)
```

---

## 🎯 Módulos Principales

### 1. Dashboard
- 4 KPIs principales
- Gráfico de rendimiento semanal
- Estado de anomalías (Pie chart)
- Alertas recientes

### 2. Analítica (DSS)
- **Filtros**: Trabajador + Fecha
- **Gráficos**: Rendimiento + Anomalías
- **Tabla**: Registros con resaltado de anomalías
- **IA**: Detección automática de comportamientos anómalos

### 3. Gemelo Digital
- Grid de estaciones de trabajo
- Progreso en tiempo real
- Eficiencia por operario
- Estado de alertas
- Resumen de planta

### 4. Gestión
- Órdenes con progreso visual
- Trabajadores con eficiencia
- Clientes con órdenes asociadas

---

## 🔐 Autenticación

### Flujo
1. Usuario ingresa credenciales en `/login`
2. Backend retorna: `{access: "token", user: {...}}`
3. Token se guarda en `localStorage`
4. Se incluye en header: `Authorization: Bearer <token>`
5. Sistema redirige a `/` (Dashboard)

### Renovación Automática
- ⚠️ Si token expira → Redirige a `/login`
- 🔄 Interceptor automático en axios

---

## 📊 Librerías Incluidas

```json
{
  "react": "^18.2.0",                    // Framework
  "react-router-dom": "^6.20.0",         // Enrutamiento
  "axios": "^1.6.0",                     // HTTP client
  "framer-motion": "^10.16.0",           // Animaciones
  "lucide-react": "^0.292.0",            // Iconos
  "recharts": "^2.10.0",                 // Gráficas
  "tailwindcss": "^3.3.0"                // Estilos
}
```

---

## ✨ Mejoras Implementadas

✅ Migración completa a Vite (mejor rendimiento)
✅ Paleta de colores profesional
✅ Sistema de autenticación JWT
✅ Interceptores de axios configurados
✅ Context API para estado global
✅ Rutas protegidas funcionando
✅ Componentes reutilizables
✅ Animaciones suaves
✅ Responsive design
✅ Gráficas interactivas
✅ Tabla con anomalías destacadas
✅ Sidebar colapsable

---

## ⚠️ Puntos Importantes

1. **Backend Corriendo**: Asegurar que Django está en `http://localhost:8000`
2. **Variables de Entorno**: Si necesitas cambiar URLs, editar `axiosConfig.js`
3. **CORS**: Configurar CORS en Django si accedes desde otro dominio
4. **Dependencies**: Ejecutar `npm install` si faltan paquetes

---

## 🎓 Estructura de Carpetas

```
frontend/
├── src/
│   ├── api/                    # Servicios HTTP
│   ├── components/             # Componentes reutilizables
│   ├── context/                # Estado global (AuthContext)
│   ├── layouts/                # Layouts (MainLayout)
│   ├── pages/                  # Páginas principales
│   ├── App.jsx                 # Rutas
│   ├── main.jsx                # Entry point
│   ├── index.css               # Estilos globales
│   └── App.css                 # Estilos app
├── public/
│   └── index.html              # HTML adaptado para Vite
├── package.json                # Dependencias
├── vite.config.js              # Configuración Vite
├── tailwind.config.js          # Configuración Tailwind
└── postcss.config.js           # Configuración PostCSS
```

---

## 🚀 Listo para Producir

El frontend está **100% funcional** y listo para:
- ✅ Desarrollo local
- ✅ Build para producción
- ✅ Deploy en servidores
- ✅ Integración con CI/CD

**¡A disfrutar tu nuevo Dashboard Industrial!** 🎉

---

**J.E.RKO - Gestor de Equipo Robusto para el Kaizen en Operaciones**
