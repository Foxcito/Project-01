import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  MapPin,
  SlidersHorizontal,
  Video as VideoIcon,
  Calendar,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { GlassView } from './GlassView';
import { formatDuration } from '@/utils/formatters';
import { MediaAsset } from '@/types/media';

interface SourceGridModalProps {
  visible: boolean;
  onClose: () => void;
  onChangeSource?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SPACING = 6;
const ITEM_SIZE = (SCREEN_WIDTH - 40 - ITEM_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export function SourceGridModal({ visible, onClose, onChangeSource }: SourceGridModalProps) {
  const { colors, haptics } = useSettings();
  const {
    queue,
    currentIndex,
    activeSourceTitle,
    activeSourceType,
    jumpToAssetIndex,
    resumeLastReviewed,
    lastReviewedAssetId,
    hasLastReviewedProgress,
  } = useMedia();

  const flatListRef = useRef<FlatList<MediaAsset>>(null);

  // Auto-scroll a la foto activa al abrir
  useEffect(() => {
    if (visible && queue.length > 0 && currentIndex > 0) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index: currentIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (_) {
          // Ignorar si el índice aún no se ha renderizado
        }
      }, 150);
    }
  }, [visible, currentIndex, queue.length]);

  const handleSelectAsset = (index: number) => {
    haptics.selection();
    jumpToAssetIndex(index);
    onClose();
  };

  const handleResumeLast = () => {
    haptics.impactMedium();
    resumeLastReviewed();
    onClose();
  };

  const renderSourceIcon = () => {
    switch (activeSourceType) {
      case 'period':
        return <Calendar size={18} color={colors.primary} />;
      case 'album':
        return <Folder size={18} color={colors.accent} />;
      case 'filter':
      default:
        return <Layers size={18} color={colors.primary} />;
    }
  };

  const renderGridItem = ({ item, index }: { item: MediaAsset; index: number }) => {
    const isCurrent = index === currentIndex;
    const isLastReviewed = item.id === lastReviewedAssetId;

    return (
      <TouchableOpacity
        onPress={() => handleSelectAsset(index)}
        activeOpacity={0.78}
        style={[
          styles.gridItem,
          {
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            borderColor: isCurrent ? colors.primary : colors.border,
            borderWidth: isCurrent ? 2.5 : 1,
            backgroundColor: colors.surfaceSubtle,
          },
        ]}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />

        {/* Badge de tipo de archivo o duración */}
        {item.mediaType === 'video' && (
          <View style={styles.videoBadge}>
            <VideoIcon size={9} color="#FFFFFF" style={{ marginRight: 2 }} />
            <Text style={styles.videoDurationText}>{formatDuration(item.duration)}</Text>
          </View>
        )}

        {/* Badge de Posición Activa */}
        {isCurrent && (
          <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]}>
            <MapPin size={10} color={colors.isDark ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.activeIndicatorText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
              Aquí
            </Text>
          </View>
        )}

        {/* Indicador de última revisada si no es la actual */}
        {!isCurrent && isLastReviewed && (
          <View style={[styles.lastReviewedDot, { backgroundColor: colors.amber }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <BlurView
            intensity={65}
            tint={colors.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Cabecera */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.tagBg }]}>
                  {renderSourceIcon()}
                </View>
                <View style={styles.headerTextCol}>
                  <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                    {activeSourceTitle}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {queue.length} archivos en cola · Posición actual: {queue.length > 0 ? currentIndex + 1 : 0}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Barra de Acciones Rápidas: Ir a última revisada + Cambiar origen */}
            <View style={[styles.quickBar, { borderColor: colors.border }]}>
              {hasLastReviewedProgress && (
                <TouchableOpacity
                  onPress={handleResumeLast}
                  activeOpacity={0.8}
                  style={[
                    styles.resumeBtn,
                    {
                      backgroundColor: colors.tagBg,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <MapPin size={13} color={colors.primary} />
                  <Text style={[styles.resumeBtnText, { color: colors.primary }]}>
                    Ir a última foto revisada
                  </Text>
                </TouchableOpacity>
              )}

              {onChangeSource && (
                <TouchableOpacity
                  onPress={() => {
                    haptics.selection();
                    onClose();
                    onChangeSource();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.changeSourceBtn,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <SlidersHorizontal size={13} color={colors.textSecondary} />
                  <Text style={[styles.changeSourceBtnText, { color: colors.textSecondary }]}>
                    Cambiar origen
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cuadrícula de Miniaturas */}
            <FlatList
              ref={flatListRef}
              data={queue}
              keyExtractor={(item) => item.id}
              renderItem={renderGridItem}
              numColumns={NUM_COLUMNS}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={true}
              initialNumToRender={21}
              maxToRenderPerBatch={24}
              windowSize={7}
              getItemLayout={(_, index) => ({
                length: ITEM_SIZE + ITEM_SPACING,
                offset: (ITEM_SIZE + ITEM_SPACING) * Math.floor(index / NUM_COLUMNS),
                index,
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Sparkles size={36} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No hay fotos en esta selección
                  </Text>
                </View>
              }
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '84%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  resumeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  resumeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  changeSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  changeSourceBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gridContent: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: ITEM_SPACING,
    marginBottom: ITEM_SPACING,
  },
  gridItem: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
  },
  lastReviewedDot: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
  },
});
