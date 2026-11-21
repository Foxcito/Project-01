import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';
import { GlassView } from '@/components/GlassView';
import { formatBytes, formatNumber } from '@/utils/formatters';
import {
  KeepGestureDirection,
  SensitivityLevel,
  AlbumActionMode,
  ThemeMode,
  TrashRetention,
  MediaTypeFilter,
} from '@/types/settings';
import {
  MoveLeft,
  ArrowDown,
  Gauge,
  FolderSync,
  PlaySquare,
  VolumeX,
  Vibrate,
  Moon,
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Palette,
  Compass,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const {
    settings,
    colors,
    haptics,
    setTheme,
    setKeepGestureDirection,
    setSensitivity,
    setAlbumActionMode,
    setTrashRetention,
    setMediaTypeFilter,
    toggleAutoplay,
    toggleDefaultMuted,
    toggleHaptics,
    resetStats,
  } = useSettings();

  const handleResetStats = () => {
    haptics.notificationWarning();
    Alert.alert(
      'Reiniciar Estadísticas',
      '¿Deseas poner a cero el contador acumulado de espacio liberado y elementos revisados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetStats },
      ]
    );
  };

  const THEME_OPTIONS: { id: ThemeMode; label: string; icon: any; desc: string; accentColor: string }[] = [
    {
      id: 'oled',
      label: 'Negro AMOLED',
      icon: Moon,
      desc: 'Negro puro OLED con acento cian brillante y máxima eficiencia energética.',
      accentColor: '#38BDF8',
    },
    {
      id: 'vintage',
      label: 'Vintage Cálido',
      icon: Sparkles,
      desc: 'Fotografía analógica: crema, papel lino, terracota y oliva suave.',
      accentColor: '#C45B3E',
    },
    {
      id: 'graphite',
      label: 'Grafito Mate',
      icon: Palette,
      desc: 'Carbón mate sofisticado con acento ámbar cálido y contraste equilibrado.',
      accentColor: '#F59E0B',
    },
    {
      id: 'nordic',
      label: 'Bruma Nórdica',
      icon: Compass,
      desc: 'Noche ártica profunda con suaves destellos de hielo glacial y azul escarchado.',
      accentColor: '#7DD3FC',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ajustes avanzados, gestos y personalización
          </Text>
        </View>

        {/* Sección: Estadísticas Acumuladas (Estricto >= 0) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ESTADÍSTICAS GLOBALES
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.keep }]}>
                  {formatBytes(Math.max(0, settings.stats?.totalBytesFreed || 0))}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Espacio Liberado</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatNumber(Math.max(0, settings.stats?.totalReviewed || 0))}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Revisados</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.trash }]}>
                  {formatNumber(Math.max(0, settings.stats?.totalTrashed || 0))}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Descartados</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleResetStats}
              activeOpacity={0.7}
              style={[styles.resetStatsRow, { borderTopColor: colors.border }]}
            >
              <RotateCcw size={14} color={colors.textSecondary} />
              <Text style={[styles.resetStatsText, { color: colors.textSecondary }]}>
                Reiniciar contadores
              </Text>
            </TouchableOpacity>
          </GlassView>
        </View>

        {/* Sección: Filtro de Contenido Multimedia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            FILTRO DE CONTENIDO
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <Layers size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Tipo de Archivo a Revisar
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Filtra la cola para fotos, videos o todo el contenido
                  </Text>
                </View>
              </View>

              <View style={[styles.pillSelector, { backgroundColor: colors.surfaceSubtle }]}>
                {(
                  [
                    { key: 'all', label: 'Todo' },
                    { key: 'photo', label: 'Fotos' },
                    { key: 'video', label: 'Videos' },
                  ] as { key: MediaTypeFilter; label: string }[]
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setMediaTypeFilter(opt.key)}
                    style={[
                      styles.pillOption,
                      settings.mediaTypeFilter === opt.key && [
                        styles.pillOptionActive,
                        { backgroundColor: colors.surface },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color:
                            settings.mediaTypeFilter === opt.key ? colors.primary : colors.textMuted,
                          fontWeight: settings.mediaTypeFilter === opt.key ? '800' : '600',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassView>
        </View>

        {/* Sección: Gestos y Deslizamiento */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            GESTOS Y CONTROL DE TARJETAS
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            {/* Dirección de Conservar */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  {settings.keepGestureDirection === 'left' ? (
                    <MoveLeft size={18} color={colors.keep} />
                  ) : (
                    <ArrowDown size={18} color={colors.keep} />
                  )}
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Dirección de Conservar
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Arriba siempre descarta. Elige hacia dónde conservar.
                  </Text>
                </View>
              </View>

              <View style={[styles.pillSelector, { backgroundColor: colors.surfaceSubtle }]}>
                {(
                  [
                    { key: 'left', label: 'Izquierda' },
                    { key: 'down', label: 'Abajo' },
                  ] as { key: KeepGestureDirection; label: string }[]
                ).map((dir) => (
                  <TouchableOpacity
                    key={dir.key}
                    onPress={() => setKeepGestureDirection(dir.key)}
                    style={[
                      styles.pillOption,
                      settings.keepGestureDirection === dir.key && [
                        styles.pillOptionActive,
                        { backgroundColor: colors.surface },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color:
                            settings.keepGestureDirection === dir.key
                              ? colors.keep
                              : colors.textMuted,
                          fontWeight: settings.keepGestureDirection === dir.key ? '800' : '600',
                        },
                      ]}
                    >
                      {dir.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Sensibilidad del gesto */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <Gauge size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Sensibilidad del Gesto
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Distancia y velocidad requeridas para activar swipe
                  </Text>
                </View>
              </View>

              <View style={[styles.pillSelector, { backgroundColor: colors.surfaceSubtle }]}>
                {(['low', 'medium', 'high'] as SensitivityLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setSensitivity(level)}
                    style={[
                      styles.pillOption,
                      settings.sensitivity === level && [
                        styles.pillOptionActive,
                        { backgroundColor: colors.surface },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: settings.sensitivity === level ? colors.text : colors.textMuted,
                          fontWeight: settings.sensitivity === level ? '800' : '600',
                        },
                      ]}
                    >
                      {level === 'low' ? 'Baja' : level === 'medium' ? 'Media' : 'Alta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassView>
        </View>

        {/* Sección: Papelera y Retención */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PAPELERA TOTAL Y RETENCIÓN
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <Clock size={18} color={colors.trash} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Tiempo de Retención
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {settings.trashRetention === '30_days'
                      ? 'Archivos en papelera caducan tras 30 días'
                      : 'Ilimitada (sin caducidad automática)'}
                  </Text>
                </View>
              </View>

              <View style={[styles.pillSelector, { backgroundColor: colors.surfaceSubtle }]}>
                {(
                  [
                    { key: '30_days', label: '30 días' },
                    { key: 'forever', label: 'Ilimitada' },
                  ] as { key: TrashRetention; label: string }[]
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setTrashRetention(opt.key)}
                    style={[
                      styles.pillOption,
                      settings.trashRetention === opt.key && [
                        styles.pillOptionActive,
                        { backgroundColor: colors.surface },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color:
                            settings.trashRetention === opt.key ? colors.trash : colors.textMuted,
                          fontWeight: settings.trashRetention === opt.key ? '800' : '600',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassView>
        </View>

        {/* Sección: Organización de Álbumes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ASIGNACIÓN A ÁLBUMES
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <FolderSync size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Modo al Asignar Carpeta
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {settings.albumActionMode === 'move'
                      ? 'Mover archivo (libera espacio en origen)'
                      : 'Copiar (mantiene el archivo en origen)'}
                  </Text>
                </View>
              </View>

              <View style={[styles.pillSelector, { backgroundColor: colors.surfaceSubtle }]}>
                {(['move', 'copy'] as AlbumActionMode[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setAlbumActionMode(mode)}
                    style={[
                      styles.pillOption,
                      settings.albumActionMode === mode && [
                        styles.pillOptionActive,
                        { backgroundColor: colors.surface },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: settings.albumActionMode === mode ? colors.text : colors.textMuted,
                          fontWeight: settings.albumActionMode === mode ? '800' : '600',
                        },
                      ]}
                    >
                      {mode === 'move' ? 'Mover' : 'Copiar'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassView>
        </View>

        {/* Sección: Reproducción y Respuesta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            MULTIMEDIA Y RESPUESTA HÁPTICA
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            {/* Autoplay de videos */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <PlaySquare size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Autoreproducción de Video
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Reproducir vista previa al mostrar tarjeta
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoplayVideos}
                onValueChange={toggleAutoplay}
                trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Audio silenciado por defecto */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <VolumeX size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Silenciar Audio Inicial
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Los videos comienzan sin sonido
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.defaultMuted}
                onValueChange={toggleDefaultMuted}
                trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Vibración Háptica */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <Vibrate size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Vibración Háptica
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Retroalimentación física en cada swipe y acción
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={toggleHaptics}
                trackColor={{ false: colors.surfaceSubtle, true: colors.primary }}
              />
            </View>
          </GlassView>
        </View>

        {/* Sección: Temas Visuales (4 Temas) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TEMA VISUAL (4 ESTILOS DISPONIBLES)
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((item) => {
                const isSelected = settings.theme === item.id;
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setTheme(item.id)}
                    activeOpacity={0.75}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: isSelected ? colors.tagBg : colors.surfaceSubtle,
                        borderColor: isSelected ? item.accentColor : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.themeIconBox,
                        {
                          backgroundColor: isSelected ? item.accentColor : colors.surface,
                        },
                      ]}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.themeCardLabel,
                        {
                          color: isSelected ? colors.text : colors.textSecondary,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={[styles.themeCardDesc, { color: colors.textMuted }]}>
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  resetStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  resetStatsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  rowDivider: {
    height: 1,
    marginVertical: 10,
  },
  pillSelector: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
  },
  pillOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeCard: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6,
  },
  themeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeCardLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  themeCardDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
