# Foxcito Cleaner 🧹✨

Una aplicación móvil para Android desarrollada con **React Native**, **Expo SDK 58** y **TypeScript** diseñada para organizar y limpiar fotos y videos de la galería mediante un flujo de tarjetas deslizables con una estética **Dark Mode OLED**, efectos **Glassmorphism**, animaciones fluidas y retroalimentación háptica.

---

## 📱 Vistas Principales

1. **Pantalla Principal (Revisión por tarjetas):**
   - **Barra Superior:** Botón Deshacer (Undo) con contador de historial, selector desplegable de filtros/álbumes (*Sin ordenar*, *Más recientes*, *Videos pesados*, *Aleatorio*, *Todos*), contador de progreso interactivo (`12 / 350 · Mes Año + MB liberados`), acceso directo a la papelera con badge de contador y botón de ajustes.
   - **Pila de Tarjetas Fluidas (Reanimated + Gesture Handler):** Deslizar hacia arriba envía el elemento a la papelera temporal interna; deslizar hacia abajo lo conserva (personalizable a ejes laterales en Ajustes).
   - **Visualización Multimedia:** Soporte de zoom con gesto de pellizco (*pinch-to-zoom*) en fotografías y reproducción automática en bucle con control de volumen para videos (`expo-video`).
   - **Barra Inferior de Asignación Rápida:** Carrusel horizontal de carpetas con contador para mover/copiar con un solo toque y botón `+ Nuevo álbum`.

2. **Pestaña Álbumes:**
   - Navegación segmentada entre **Organizados** (carpetas reales del dispositivo) y **Sin organizar** (elementos en cámara principal sin asignar).
   - Acceso directo "Revisar Álbum" para filtrar la pila de tarjetas únicamente por esa carpeta.
   - Creación de álbumes directamente en el sistema de archivos del dispositivo.

3. **Papelera Temporal Ilimitada:**
   - Cuadrícula de fotos y videos descartados con el espacio total exacto que ocupan.
   - Restauración individual de cada archivo o restauración masiva ("Restaurar Todo").
   - Botón inferior **Vaciar Papelera** que ejecuta el borrado definitivo en lote en el almacenamiento de Android a través de `expo-media-library`.

4. **Configuración (Ajustes Avanzados):**
   - Invertir eje de gestos: Vertical (*Arriba / Abajo*) vs Lateral (*Izquierda / Derecha*).
   - Sensibilidad del deslizamiento: *Baja*, *Media*, *Alta*.
   - Modo de asignación: *Mover* (libera espacio en origen) vs *Copiar*.
   - Interruptores de reproducción automática de videos, audio silenciado por defecto y vibración háptica (`expo-haptics`).
   - Selector de temas visuales: *Negro OLED puro*, *Glass Dark* y *Claro*.
   - Métricas acumuladas: Espacio total liberado en MB/GB, total de elementos revisados y descartados.

---

## 🛠️ Tecnologías y Librerías

- **Expo SDK 58** + **Expo Router** (`src/app/`)
- **React Native 0.88** & **React 19**
- **expo-media-library**: Gestión de permisos, lectura de galería, creación de álbumes y eliminación en lote.
- **expo-video**: Reproductor nativo moderno (`useVideoPlayer`, `VideoView`).
- **react-native-reanimated** & **react-native-gesture-handler**: Física de tarjetas, animaciones e interpolación en UI thread.
- **@react-native-async-storage/async-storage**: Persistencia local de configuración, papelera temporal y estados.
- **expo-haptics**: Respuesta táctil sutil en cada interacción.
- **expo-blur** & **expo-linear-gradient**: Efectos de cristal esmerilado (*glassmorphism*).

---

## 🚀 Comandos

```bash
# Iniciar servidor de desarrollo
npx expo start

# Ejecutar en Android
npx expo start --android

# Diagnóstico de dependencias
npx expo-doctor

# Verificación de tipos TypeScript
npx tsc --noEmit
```
