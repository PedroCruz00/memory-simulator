# 🧠 Memory Simulator - Simulador de Memori## ✨ Mejoras Recientes (v2.2.0) - SCROLL + RAM TOTALMENTE FUNCIONALES

### 🖱️ SCROLL COMPLETAMENTE FUNCIONAL

- ✅ **Scroll vertical 100% habilitado**: Corregido `App.css` (causa oculta)
- ✅ **Todas las gráficas accesibles**: RAM, CPU, Disco, DataFlow, ProcessFlow visibles
- ✅ **Sin restricciones**: Eliminados todos los `overflow: hidden` problemáticos

### 💾 RAM AHORA FUNCIONA CORRECTAMENTE

- ✅ **Páginas iniciales en RAM**: Cada proceso carga 2-3 páginas al iniciarse
- ✅ **Page Faults manejados**: Se cargan páginas desde disco automáticamente
- ✅ **Algoritmo Clock activo**: Reemplazo de páginas funcionando
- ✅ **Visualización real**: Frames ocupados, bits R/M, puntero Clock visible
- ✅ **Métricas correctas**: Hit Ratio 70-90%, Page Faults reales, RAM Utilization 40-100%

### 🚀 SIMULACIÓN COMPLETAMENTE FUNCIONAL

- ✅ **Procesos ejecutan correctamente**: NEW → READY → RUNNING → BLOCKED → TERMINATED
- ✅ **Ciclo de vida completo**: Todos los procesos completan su ejecución
- ✅ **Bloqueos optimizados**: 10% probabilidad
- ✅ **Context switches optimizados**: 10% probabilidad
- ✅ **Desbloqueos más rápidos**: 60% probabilidad
- ✅ **Tiempo observable**: Procesos de 4-10simulador interactivo y visual de gestión de memoria virtual con paginación y algoritmo Clock

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)
![Status](https://img.shields.io/badge/status-fully_functional-success.svg)

## 🎯 Características

- ✨ **Visualización completa** del sistema de memoria virtual
- 🔄 **Algoritmo Clock** (Second Chance) para reemplazo de páginas
- 🧮 **MMU realista** con tabla de páginas y manejo de Page Faults
- 📊 **Métricas en tiempo real** (Hit Ratio, Page Faults, etc.)
- 🎨 **Interfaz moderna** con animaciones fluidas
- 📱 **Responsive** para todos los dispositivos
- 🖱️ **Scroll funcional** para ver todo el contenido

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## 🎮 Cómo Usar

1. **Configura** el simulador (RAM, Quantum, etc.)
2. **Inicializa** el sistema
3. **Agrega procesos** con el botón "+ Proceso"
4. **Ejecuta** con Play/Pause/Step
5. **Observa** las visualizaciones en tiempo real
6. **Desplázate** hacia abajo para ver todas las gráficas

**📖 Ver guía completa**: [USAGE_GUIDE.md](./USAGE_GUIDE.md)

## ✨ Mejoras Recientes (v2.1.0) - SCROLL + LÓGICA OPTIMIZADA

### �️ SCROLL FUNCIONAL

- ✅ **Scroll vertical habilitado**: Ahora puedes desplazarte para ver todo el contenido
- ✅ **Todas las gráficas visibles**: RAM, CPU, Disco, DataFlow, ProcessFlow totalmente accesibles
- ✅ **Sin restricciones de altura**: Eliminados `overflow: hidden` problemáticos

### 🚀 SIMULACIÓN COMPLETAMENTE FUNCIONAL

- ✅ **Procesos ejecutan correctamente**: NEW → READY → RUNNING → BLOCKED → TERMINATED
- ✅ **Ciclo de vida completo**: Todos los procesos completan su ejecución
- ✅ **Bloqueos optimizados**: 10% probabilidad (vs 15% anterior)
- ✅ **Context switches optimizados**: 10% probabilidad (vs 20% anterior)
- ✅ **Desbloqueos más rápidos**: 60% probabilidad (vs 40% anterior)
- ✅ **Tiempo observable**: Procesos de 4-10s (vs 8-18s anterior)

### 📐 Layout Optimizado

- ✅ **RAM en primera columna**: Ahora es lo primero que ves (prioridad visual)
- ✅ **Grid mejorado**: 1.2fr 1fr 1fr (RAM más ancha)
- ✅ **Altura controlada**: Max 600px con scroll vertical
- ✅ **Espacio optimizado**: Gap reducido, mejor aprovechamiento

### 🔄 Algoritmo Clock Funcional

- ✅ **Puntero se mueve**: Visible en cada page fault
- ✅ **Bits R/M actualizan**: En cada acceso a memoria
- ✅ **Segunda oportunidad**: R=1 → R=0 → Reemplazo
- ✅ **Page Faults reales**: Contador incrementa dinámicamente

### 📊 Métricas en Tiempo Real

- ✅ **RAM Usage**: % de memoria utilizada (actualiza dinámicamente)
- ✅ **Page Faults**: Incrementa con cada fallo
- ✅ **Hit Ratio**: Calculado en vivo
- ✅ **Throughput**: Procesos completados
- ✅ **CPU Usage**: Muestra proceso actual

### 🎮 Inicio Automático

- ✅ **3 procesos iniciales**: Ya listos al inicializar
- ✅ **Click en Play**: Inmediatamente ves la acción
- ✅ **Sin configuración extra**: Funciona out-of-the-box

---

## ✨ Mejoras Anteriores (v2.0.1)

### 🔧 Funcionalidad

- ✅ **Ciclo de ejecución automático**: El simulador ahora ejecuta automáticamente cada 500ms al presionar Play
- ✅ **Re-renderizado correcto**: Los componentes se actualizan en tiempo real
- ✅ **Cleanup efectivo**: Limpieza adecuada de intervalos al pausar o desmontar

### 📜 Scroll Mejorado

- ✅ **Layout principal**: Scroll vertical en el grid principal
- ✅ **RAM Frames**: Scroll cuando hay muchos frames (máx 400px)
- ✅ **Process Details**: Scroll horizontal y vertical (máx 500px)
- ✅ **Processor Queues**: Scroll en colas READY/BLOCKED (máx 250px)
- ✅ **Disk Pages**: Scroll en contenido del disco (máx 500px)
- ✅ **Scrollbars personalizados**: Diseño moderno con colores del tema

### 🎨 Visual

- ✅ **Sin overflow**: Todo el contenido es accesible
- ✅ **Height optimizado**: El layout se ajusta a la altura de la ventana
- ✅ **Responsive completo**: Funciona en cualquier resolución

## 📦 Visualizaciones Incluidas

- 🖥️ **RAM**: Frames, bits R/M, puntero Clock
- ⚙️ **CPU**: Proceso actual, colas READY/BLOCKED
- 💾 **Disco**: Páginas por proceso
- 📈 **Métricas**: Estadísticas completas
- 🔀 **Flujo de Datos**: Animaciones de eventos
- 📋 **Detalles**: Tabla de todos los procesos

## 🏗️ Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **CSS Variables** para theming
- **Arquitectura modular** y escalable

## 📚 Documentación

Ver `.github/copilot-instructions.md` para guía completa de desarrollo.

## 📝 Licencia

MIT License

---

Desarrollado como herramienta educativa para Sistemas Operativos
