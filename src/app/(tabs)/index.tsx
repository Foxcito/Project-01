import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { GlassView } from '@/components/GlassView';
import { CreateAlbumModal } from '@/components/CreateAlbumModal';
import { FilterType, TimePeriodGroup, AlbumItem } from '@/types/media';
import { formatBytes, formatNumber } from '@/utils/formatters';
import {
  Sparkles,
  FolderClock,
  Video,
  Shuffle,
  Layers,
  Calendar,
  Folder,
  Camera,
  FolderPlus,
  ArrowRight,
  SlidersHorizontal,
  Play,
  CheckCheck,
} from 'lucide-react-native';

export default function HomeScreen() {
  const { colors, haptics, settings } = useSettings();
  const {
    filterCounts,
    timePeriods,
    cameraAlbum,
    otherAlbums,
    setFilter,
    selectPeriodForReview,
    selectAlbumForReview,
    createNewAlbum,
  } = useMedia();

  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Navegar a la pantalla de revisión con el filtro seleccionado
  const handleOpenFilter = (filter: FilterType) => {
    haptics.impactLight();
    setFilter(filter);
    router.push('/(tabs)/review');
  };

  // Navegar a revisión por mes/período
  const handleOpenPeriod = (period: TimePeriodGroup) => {
    haptics.impactLight();
    selectPeriodForReview(period);
    router.push('/(tabs)/review');
  };

  // Navegar a revisión por carpeta
  const handleOpenAlbum = (album: AlbumItem) => {
    haptics.impactLight();
    selectAlbumForReview(album);
    router.push('/(tabs)/review');
  };

  const freedFormatted = formatBytes(Math.max(0, settings.stats?.totalBytesFreed || 0));

  const FILTERS_CONFIG: {
    id: FilterType;
    title: string;
    description: string;
    icon: any;
    count: number;
    accentColor: string;
  }[] = [
    {
      id: 'unorganized',
      title: 'Sin ordenar',
      description: 'Cámara y archivos sin clasificar',
      icon: FolderClock,
      count: filterCounts.unorganized,
      accentColor: colors.primary,
    },
    {
      id: 'recent',
      title: 'Más recientes',
      description: 'Orden cronológico inverso',
      icon: Sparkles,
      count: filterCounts.recent,
      accentColor: colors.accent,
    },
    {
      id: 'heavy_videos',
      title: 'Videos pesados',
      description: 'Mayor tamaño para liberar espacio',
      icon: Video,
      count: filterCounts.heavy_videos,
      accentColor: '#F43F5E',
    },
    {
      id: 'random',
      title: 'Aleatorio',
      description: 'Descubre fotos y videos al azar',
      icon: Shuffle,
      count: filterCounts.random,
      accentColor: '#8B5CF6',
    },
    {
      id: 'all',
      title: 'Todos los elementos',
      description: 'Toda la galería completa',
      icon: Layers,
      count: filterCounts.all,
      accentColor: colors.textSecondary,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera Principal de Inicio */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.appTitle, { color: colors.text }]}>Foxcito Cleaner</Text>
              <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
                Organiza tu galería y libera espacio
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                router.push('/settings');
              }}
              activeOpacity={0.7}
              style={[styles.settingsBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <SlidersHorizontal size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Banner Resumen de Espacio Liberado */}
          <GlassView
            intensity={30}
            borderRadius={18}
            style={[styles.statsBanner, { borderColor: colors.border }]}
          >
            <View style={styles.statsBannerItem}>
              <View style={[styles.statDot, { backgroundColor: colors.keep }]} />
              <Text style={[styles.statsBannerText, { color: colors.textSecondary }]}>
                Liberado:{' '}
                <Text style={[styles.statsBannerHighlight, { color: colors.keep }]}>
                  {freedFormatted}
                </Text>
              </Text>
            </View>

            <View style={[styles.bannerDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statsBannerItem}>
              <CheckCheck size={14} color={colors.primary} />
              <Text style={[styles.statsBannerText, { color: colors.textSecondary }]}>
                Revisados:{' '}
                <Text style={[styles.statsBannerHighlight, { color: colors.text }]}>
                  {formatNumber(Math.max(0, settings.stats?.totalReviewed || 0))}
                </Text>
              </Text>
            </View>
          </GlassView>
        </View>

        {/* ============================================================ */}
        {/* SECCIÓN 1: FILTROS RÁPIDOS */}
        {/* ============================================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              FILTROS DE REVISIÓN
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Toca para entrar directo
            </Text>
          </View>

          <View style={styles.filtersGrid}>
            {FILTERS_CONFIG.map((filter) => {
              const IconComp = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => handleOpenFilter(filter.id)}
                  activeOpacity={0.75}
                  style={filter.id === 'unorganized' ? styles.filterCardFull : styles.filterCardHalf}
                >
                  <GlassView
                    intensity={28}
                    borderRadius={20}
                    style={[
                      styles.filterCardGlass,
                      {
                        borderColor: filter.id === 'unorganized' ? colors.primary : colors.border,
                        backgroundColor: filter.id === 'unorganized' ? colors.tagBg : colors.surfaceSubtle,
                      },
                    ]}
                  >
                    <View style={styles.filterCardTop}>
                      <View
                        style={[
                          styles.filterIconBox,
                          {
                            backgroundColor: filter.id === 'unorganized' ? colors.primary : colors.surface,
                          },
                        ]}
                      >
                        <IconComp
                          size={18}
                          color={filter.id === 'unorganized' ? (colors.isDark ? '#000000' : '#FFFFFF') : filter.accentColor}
                        />
                      </View>

                      <View
                        style={[
                          styles.countPill,
                          {
                            backgroundColor: filter.id === 'unorganized' ? colors.primary : colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countPillText,
                            {
                              color: filter.id === 'unorganized' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.text,
                            },
                          ]}
                        >
                          {filter.count}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.filterTitle, { color: colors.text }]}>
                      {filter.title}
                    </Text>
                    <Text
                      style={[styles.filterDesc, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {filter.description}
                    </Text>
                  </GlassView>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ============================================================ */}
        {/* SECCIÓN 2: LÍNEA DE TIEMPO (MESES Y AÑOS) */}
        {/* ============================================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              MESES Y AÑOS ({timePeriods.length})
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Revisa por fecha
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodsScrollContent}
          >
            {timePeriods.map((period) => (
              <TouchableOpacity
                key={period.key}
                onPress={() => handleOpenPeriod(period)}
                activeOpacity={0.8}
                style={styles.periodCardWrapper}
              >
                <GlassView
                  intensity={30}
                  borderRadius={20}
                  style={[styles.periodCard, { borderColor: colors.border }]}
                >
                  {period.sampleUri ? (
                    <Image
                      source={{ uri: period.sampleUri }}
                      style={styles.periodImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.periodImageFallback, { backgroundColor: colors.surfaceSubtle }]}>
                      <Calendar size={28} color={colors.primary} />
                    </View>
                  )}

                  <View style={styles.periodInfo}>
                    <Text style={[styles.periodLabel, { color: colors.text }]} numberOfLines={1}>
                      {period.label}
                    </Text>
                    <Text style={[styles.periodMeta, { color: colors.textSecondary }]}>
                      {period.count} archivos · {formatBytes(period.totalBytes)}
                    </Text>
                  </View>

                  <View style={[styles.periodActionRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.periodActionText, { color: colors.primary }]}>
                      Revisar Mes
                    </Text>
                    <ArrowRight size={13} color={colors.primary} />
                  </View>
                </GlassView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SECCIÓN 3: CARPETAS DEL DISPOSITIVO */}
        {/* ============================================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              CARPETAS DEL DISPOSITIVO
            </Text>
            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                setCreateModalVisible(true);
              }}
              activeOpacity={0.7}
              style={[styles.newFolderBtn, { backgroundColor: colors.tagBg, borderColor: colors.primary }]}
            >
              <FolderPlus size={13} color={colors.primary} />
              <Text style={[styles.newFolderBtnText, { color: colors.primary }]}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>

          {/* Cámara Principal destacada */}
          <TouchableOpacity
            onPress={() => handleOpenAlbum(cameraAlbum)}
            activeOpacity={0.8}
            style={styles.cameraBannerTouchable}
          >
            <GlassView
              intensity={35}
              borderRadius={22}
              style={[
                styles.cameraCard,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.tagBg,
                },
              ]}
            >
              <View style={styles.cameraLeft}>
                <View style={[styles.cameraIconBox, { backgroundColor: colors.primary }]}>
                  <Camera size={22} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                </View>
                <View style={styles.cameraMeta}>
                  <Text style={[styles.cameraTitle, { color: colors.text }]}>
                    {cameraAlbum.title}
                  </Text>
                  <Text style={[styles.cameraSubtitle, { color: colors.textSecondary }]}>
                    {cameraAlbum.assetCount} fotos y videos disponibles
                  </Text>
                </View>
              </View>

              <View style={[styles.reviewPill, { backgroundColor: colors.primary }]}>
                <Play size={11} color={colors.isDark ? '#000000' : '#FFFFFF'} fill={colors.isDark ? '#000000' : '#FFFFFF'} />
                <Text
                  style={[
                    styles.reviewPillText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  Revisar
                </Text>
              </View>
            </GlassView>
          </TouchableOpacity>

          {/* Lista de demás carpetas */}
          <View style={styles.foldersList}>
            {otherAlbums.map((album) => (
              <TouchableOpacity
                key={album.id}
                onPress={() => handleOpenAlbum(album)}
                activeOpacity={0.75}
                style={styles.folderRowTouchable}
              >
                <GlassView
                  intensity={26}
                  borderRadius={18}
                  style={[styles.folderRowGlass, { borderColor: colors.border }]}
                >
                  <View style={styles.folderRowLeft}>
                    <View style={[styles.folderIconBox, { backgroundColor: colors.surfaceSubtle }]}>
                      <Folder size={18} color={colors.accent} />
                    </View>
                    <View style={styles.folderRowText}>
                      <Text style={[styles.folderRowTitle, { color: colors.text }]} numberOfLines={1}>
                        {album.title}
                      </Text>
                      <Text style={[styles.folderRowCount, { color: colors.textSecondary }]}>
                        {album.assetCount} archivos organizados
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.folderMiniBtn, { backgroundColor: colors.tagBg }]}>
                    <ArrowRight size={14} color={colors.primary} />
                  </View>
                </GlassView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal para crear nuevo álbum */}
      <CreateAlbumModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={async (name) => {
          await createNewAlbum(name);
        }}
      />
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
    paddingBottom: 100,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  appSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  statsBannerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statsBannerText: {
    fontSize: 12,
  },
  statsBannerHighlight: {
    fontWeight: '700',
  },
  bannerDivider: {
    width: 1,
    height: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: 11,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterCardFull: {
    width: '100%',
  },
  filterCardHalf: {
    width: '48.5%',
  },
  filterCardGlass: {
    padding: 14,
    borderWidth: 1,
  },
  filterCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  filterDesc: {
    fontSize: 11,
  },
  periodsScrollContent: {
    gap: 12,
    paddingVertical: 2,
  },
  periodCardWrapper: {
    width: 180,
  },
  periodCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  periodImage: {
    width: '100%',
    height: 100,
  },
  periodImageFallback: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodInfo: {
    padding: 12,
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  periodMeta: {
    fontSize: 10,
  },
  periodActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  periodActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  newFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  newFolderBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cameraBannerTouchable: {
    width: '100%',
  },
  cameraCard: {
    padding: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cameraIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraMeta: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cameraSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  reviewPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  foldersList: {
    gap: 8,
  },
  folderRowTouchable: {
    width: '100%',
  },
  folderRowGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
  },
  folderRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderRowText: {
    flex: 1,
  },
  folderRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  folderRowCount: {
    fontSize: 11,
    marginTop: 2,
  },
  folderMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
