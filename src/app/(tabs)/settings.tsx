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
  GestureDirection,
  SensitivityLevel,
  AlbumActionMode,
  ThemeMode,
} from '@/types/settings';
import {
  Sliders,
  MoveVertical,
  MoveHorizontal,
  Gauge,
  FolderSync,
  PlaySquare,
  VolumeX,
  Vibrate,
  Moon,
  Sparkles,
  BarChart3,
  RotateCcw,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const {
    settings,
    colors,
    haptics,
    setTheme,
    setGestureDirection,
    setSensitivity,
    setAlbumActionMode,
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
            Personaliza el flujo de limpieza y la apariencia
          </Text>
        </View>

        {/* Sección: Estadísticas Acumuladas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ESTADÍSTICAS GLOBALES
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.keep }]}>
                  {formatBytes(settings.stats.totalBytesFreed)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Espacio Liberado</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatNumber(settings.stats.totalReviewed)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Revisados</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.trash }]}>
                  {formatNumber(settings.stats.totalTrashed)}
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

        {/* Sección: Controles y Gestos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            GESTOS Y DESLIZAMIENTO
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            {/* Dirección del gesto */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  {settings.gestureDirection === 'vertical' ? (
                    <MoveVertical size={18} color={colors.accent} />
                  ) : (
                    <MoveHorizontal size={18} color={colors.accent} />
                  )}
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Eje de Deslizamiento
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {settings.gestureDirection === 'vertical'
                      ? 'Arriba (Basura) / Abajo (Guardar)'
                      : 'Izquierda (Basura) / Derecha (Guardar)'}
                  </Text>
                </View>
              </View>

              <View style={[styles.pillSelector, { backgroundColor: colors.surfaceSubtle }]}>
                {(['vertical', 'horizontal'] as GestureDirection[]).map((dir) => (
                  <TouchableOpacity
                    key={dir}
                    onPress={() => setGestureDirection(dir)}
                    style={[
                      styles.pillOption,
                      settings.gestureDirection === dir && [
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
                            settings.gestureDirection === dir ? colors.text : colors.textMuted,
                        },
                      ]}
                    >
                      {dir === 'vertical' ? 'Vertical' : 'Lateral'}
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
                  <Gauge size={18} color={colors.accent} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Sensibilidad del Gesto
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Distancia requerida para activar la acción
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

        {/* Sección: Organización de Álbumes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ASIGNACIÓN A ÁLBUMES
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
                  <FolderSync size={18} color={colors.accent} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Modo al Asignar Carpeta
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {settings.albumActionMode === 'move'
                      ? 'Mover archivo (libera espacio en origen)'
                      : 'Copiar (mantiene el original)'}
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
                  <PlaySquare size={18} color={colors.accent} />
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
                  <VolumeX size={18} color={colors.accent} />
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
                  <Vibrate size={18} color={colors.accent} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Vibración Háptica
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Retroalimentación táctil en cada swipe y acción
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

        {/* Sección: Tema Visual */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TEMA VISUAL
          </Text>
          <GlassView intensity={30} borderRadius={20} style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.themeOptionsGrid}>
              {[
                {
                  id: 'oled',
                  label: 'Negro AMOLED',
                  icon: Moon,
                  desc: 'Fondo negro puro, superficies de grafito y acento cian minimalista.',
                },
                {
                  id: 'vintage',
                  label: 'Vintage Cálido',
                  icon: Sparkles,
                  desc: 'Fotografía analógica: crema, papel lino, terracota y oliva suave.',
                },
              ].map((item) => {
                const isSelected = settings.theme === item.id;
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setTheme(item.id as ThemeMode)}
                    activeOpacity={0.75}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: isSelected ? colors.tagBg : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.themeIconBox,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                        },
                      ]}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
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
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
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
  themeOptionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  themeCard: {
    flex: 1,
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
  },
  themeCardDesc: {
    fontSize: 10,
  },
});
