# Foxcito Cleaner 🧹✨

Una aplicación móvil para Android desarrollada con **React Native**, **Expo SDK 58** y **TypeScript** diseñada para organizar y limpiar fotos y videos de la galería mediante un flujo de tarjetas deslizables con identidad propia y dos estéticas seleccionables: **Negro AMOLED Moderno** y **Estilo Vintage Cálido**.

---

## 🎨 Identidad Visual y Temas

La app cuenta con selector de temas y botón de alternancia rápida (*Quick Switcher*) en la barra superior:
1. **Negro AMOLED Moderno:** Fondo negro puro (`#000000`), superficies en grafito profundo (`#0A0C10`), bordes sutiles ultra limpios, efectos translúcidos glassmorphism y acento minimalista cian eléctrico (`#38BDF8`).
2. **Estilo Vintage Cálido:** Paleta inspirada en fotografía editorial clásica y analógica con tonos crema (`#F5EFEB`), papel lino/marfil, terracota suave (`#C45B3E`), mostaza bronce y verde oliva apagado (`#476E4B`).

---

## 📱 Funcionalidades Principales

1. **Pantalla Principal (Revisión por tarjetas y visor):**
   - **Gesto Limpio y Fluido:** Únicamente la tarjeta activa se mueve con el arrastre; la tarjeta de fondo se mantiene estable en su posición sin oscilaciones ni temblores, y las etiquetas dinámicas (*DESCARTAR* / *CONSERVAR*) se reinician de inmediato al avanzar.
   - **Visor Multimedia:** Zoom de pellizco (*pinch-to-zoom*) en fotos y reproducción continua en bucle con control de sonido para videos (`expo-video`).
   - **Detalles en Tarjeta:** Fecha y hora exacta visibles (`18 Nov 2026 · 14:35`), tamaño del archivo en MB y duración.
   - **Barra de Atajos Rápidos de Acción:** Botones de acceso directo para *Deshacer (Undo)*, *Papelera (Descartar)*, *Compartir (Share nativo)* y *Siguiente (Conservar)*.
   - **Barra Inferior de Carpetas/Álbumes:** Carrusel horizontal de carpetas con contador, botón `+ Nuevo` y botón de confirmación explícito **"Aplicar"** para mover o copiar el archivo actual.

2. **Organización por Meses/Años y Carpetas:**
   - **Línea Temporal (Meses y Años):** Agrupación automática de fotos y videos por mes y año (*Noviembre 2026*, *Octubre 2026*, etc.) con conteo de archivos, espacio total y botón directo para revisar solo ese período.
   - **Carpetas del Dispositivo:** Tarjeta destacada para **Cámara Principal** (DCIM / fotos sin clasificar) y listado de álbumes del dispositivo con acceso directo para revisión focalizada.

3. **Papelera Temporal Ilimitada:**
   - Visualización en cuadrícula de todos los elementos descartados con su peso individual y total acumulado.
   - Opciones para restaurar archivos individualmente o en bloque (*Restaurar Todo*).
   - Botón **Vaciar Papelera** que ejecuta el borrado definitivo en lote en el almacenamiento de Android a través de `expo-media-library`.

4. **Configuración y Ajustes Avanzados:**
   - Invertir eje de gestos: Vertical (*Arriba / Abajo*) o Lateral (*Izquierda / Derecha*).
   - Sensibilidad configurable: *Baja*, *Media*, *Alta*.
   - Modo de acción al asignar carpeta: *Mover* (libera espacio en origen) vs *Copiar*.
   - Reproducción automática y silenciado inicial de video.
   - Respuesta háptica configurable (`expo-haptics`).
   - Estadísticas acumuladas de espacio liberado (MB/GB) y archivos organizados.

---

## 🛠️ Tecnologías y Librerías

- **Expo SDK 58** + **Expo Router**
- **React Native 0.88** & **React 19**
- **expo-media-library**: Gestión granular de permisos (`photo`, `video`), lectura de galería, creación de carpetas y eliminación en lote.
- **expo-video**: Motor nativo moderno de video (`useVideoPlayer`, `VideoView`).
- **react-native-reanimated** & **react-native-gesture-handler**: Física interactiva y animaciones en UI thread.
- **@react-native-async-storage/async-storage**: Persistencia local de temas, configuraciones y papelera interna.
- **expo-haptics**: Sensación táctil refinada en cada interacción.
- **expo-blur**: Efectos de cristal esmerilado translúcido.

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
