import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { GlassView } from '@/components/GlassView';
import { CreateAlbumModal } from '@/components/CreateAlbumModal';
import { AlbumItem, TimePeriodGroup } from '@/types/media';
import { formatBytes } from '@/utils/formatters';
import {
  Folder,
  FolderPlus,
  Play,
  Calendar,
  Camera,
  Layers,
  ArrowRight,
} from 'lucide-react-native';
import { router } from 'expo-router';

type AlbumViewMode = 'timeline' | 'folders';

export default function AlbumsScreen() {
  const { colors, haptics } = useSettings();
  const {
    timePeriods,
    cameraAlbum,
    otherAlbums,
    selectAlbumForReview,
    selectPeriodForReview,
    createNewAlbum,
  } = useMedia();

  const [activeMode, setActiveMode] = useState<AlbumViewMode>('timeline');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleReviewPeriod = (period: TimePeriodGroup) => {
    haptics.impactLight();
    selectPeriodForReview(period);
    router.replace('/');
  };

  const handleReviewAlbum = (album: AlbumItem) => {
    haptics.impactLight();
    selectAlbumForReview(album);
    router.replace('/');
  };

  // Renderizador para tarjetas de meses/años
  const renderPeriodItem = ({ item }: { item: TimePeriodGroup }) => (
    <GlassView
      intensity={30}
      borderRadius={22}
      style={[styles.periodCard, { borderColor: colors.border }]}
    >
      <View style={styles.periodCardLeft}>
        {item.sampleUri ? (
          <Image source={{ uri: item.sampleUri }} style={styles.periodThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.periodThumbFallback, { backgroundColor: colors.surfaceSubtle }]}>
            <Calendar size={22} color={colors.primary} />
          </View>
        )}

        <View style={styles.periodMeta}>
          <Text style={[styles.periodTitle, { color: colors.text }]}>{item.label}</Text>
          <Text style={[styles.periodSubtitle, { color: colors.textSecondary }]}>
            {item.count} {item.count === 1 ? 'archivo' : 'archivos'} · {formatBytes(item.totalBytes)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleReviewPeriod(item)}
        activeOpacity={0.8}
        style={[styles.reviewBtn, { backgroundColor: colors.tagBg, borderColor: colors.primary }]}
      >
        <Play size={12} color={colors.primary} fill={colors.primary} />
        <Text style={[styles.reviewBtnText, { color: colors.primary }]}>Revisar</Text>
      </TouchableOpacity>
    </GlassView>
  );

  // Renderizador para tarjetas de álbumes
  const renderAlbumItem = ({ item }: { item: AlbumItem }) => (
    <GlassView
      intensity={28}
      borderRadius={20}
      style={[styles.albumCard, { borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceSubtle }]}>
          <Folder size={22} color={colors.accent} />
        </View>
        <View style={styles.albumMeta}>
          <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.albumCount, { color: colors.textSecondary }]}>
            {item.assetCount} {item.assetCount === 1 ? 'archivo' : 'archivos'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleReviewAlbum(item)}
        activeOpacity={0.8}
        style={[styles.reviewBtn, { backgroundColor: colors.tagBg, borderColor: colors.primary }]}
      >
        <Play size={12} color={colors.primary} fill={colors.primary} />
        <Text style={[styles.reviewBtnText, { color: colors.primary }]}>Revisar</Text>
      </TouchableOpacity>
    </GlassView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Organización</Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              Navega por períodos temporales o carpetas
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setCreateModalVisible(true);
            }}
            activeOpacity={0.8}
            style={[styles.newAlbumBtn, { backgroundColor: colors.primary }]}
          >
            <FolderPlus size={15} color="#FFFFFF" />
            <Text style={styles.newAlbumBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de Pestañas: Por Períodos vs Por Carpetas */}
        <View style={[styles.tabSegmentContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setActiveMode('timeline');
            }}
            style={[
              styles.tabSegment,
              activeMode === 'timeline' && [styles.activeTabSegment, { backgroundColor: colors.surface }],
            ]}
          >
            <Text
              style={[
                styles.tabSegmentText,
                { color: activeMode === 'timeline' ? colors.text : colors.textMuted },
              ]}
            >
              Meses y Años ({timePeriods.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setActiveMode('folders');
            }}
            style={[
              styles.tabSegment,
              activeMode === 'folders' && [styles.activeTabSegment, { backgroundColor: colors.surface }],
            ]}
          >
            <Text
              style={[
                styles.tabSegmentText,
                { color: activeMode === 'folders' ? colors.text : colors.textMuted },
              ]}
            >
              Carpetas del Dispositivo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vista por Períodos */}
        {activeMode === 'timeline' ? (
          <FlatList
            data={timePeriods}
            keyExtractor={(item) => item.key}
            renderItem={renderPeriodItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Calendar size={44} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No se encontraron períodos de fotos en la galería.
                </Text>
              </View>
            }
          />
        ) : (
          /* Vista por Carpetas: Cámara Principal destacada + Álbumes */
          <FlatList
            data={otherAlbums}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbumItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.cameraBannerWrapper}>
                {/* Banner Destacado de Cámara */}
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
                    <View style={[styles.cameraIconCircle, { backgroundColor: colors.primary }]}>
                      <Camera size={22} color="#FFFFFF" />
                    </View>
                    <View style={styles.cameraMeta}>
                      <Text style={[styles.cameraTitle, { color: colors.text }]}>
                        {cameraAlbum.title}
                      </Text>
                      <Text style={[styles.cameraSubtitle, { color: colors.textSecondary }]}>
                        {cameraAlbum.assetCount} fotos y videos sin archivar
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleReviewAlbum(cameraAlbum)}
                    activeOpacity={0.85}
                    style={[styles.cameraReviewBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.cameraReviewBtnText}>Revisar</Text>
                    <ArrowRight size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </GlassView>

                <Text style={[styles.sectionDividerTitle, { color: colors.textMuted }]}>
                  OTROS ÁLBUMES DEL DISPOSITIVO ({otherAlbums.length})
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Folder size={44} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No se encontraron otras carpetas adicionales.
                </Text>
              </View>
            }
          />
        )}
      </View>

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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  newAlbumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
  },
  newAlbumBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tabSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 13,
    borderWidth: 1,
    padding: 3,
    marginBottom: 14,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tabSegmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 95,
    gap: 10,
  },
  periodCard: {
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  periodThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  periodThumbFallback: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodMeta: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  periodSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cameraBannerWrapper: {
    marginBottom: 10,
    gap: 12,
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
  cameraIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 12,
    marginTop: 2,
  },
  cameraReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cameraReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionDividerTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 4,
    marginTop: 6,
  },
  albumCard: {
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumMeta: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  albumCount: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
