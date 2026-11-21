import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { FilterType, TimePeriodGroup, AlbumItem } from '@/types/media';
import { FILTER_OPTIONS } from '@/constants/filters';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { GlassView } from './GlassView';
import { formatBytes } from '@/utils/formatters';
import {
  Sparkles,
  FolderClock,
  Video,
  Shuffle,
  Layers,
  Check,
  X,
  Calendar,
  Folder,
  Camera,
} from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FilterModal({ visible, onClose }: FilterModalProps) {
  const { colors, haptics } = useSettings();
  const {
    activeFilter,
    selectedPeriod,
    selectedAlbum,
    setFilter,
    selectPeriodForReview,
    selectAlbumForReview,
    timePeriods,
    cameraAlbum,
    otherAlbums,
  } = useMedia();

  const [activeTab, setActiveTab] = useState<'filters' | 'periods' | 'folders'>('filters');

  const renderIcon = (id: FilterType, isSelected: boolean) => {
    const iconColor = isSelected ? colors.primary : colors.textSecondary;
    const size = 18;
    switch (id) {
      case 'unorganized':
        return <FolderClock size={size} color={iconColor} />;
      case 'recent':
        return <Sparkles size={size} color={iconColor} />;
      case 'heavy_videos':
        return <Video size={size} color={iconColor} />;
      case 'random':
        return <Shuffle size={size} color={iconColor} />;
      case 'all':
      default:
        return <Layers size={size} color={iconColor} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <GlassView
            intensity={45}
            borderRadius={28}
            style={[styles.glassCard, { borderColor: colors.border }]}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Explorar Galería</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Elige qué fotos y videos deseas revisar
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
                  onClose();
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              >
                <X size={17} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Pestañas de Navegación del Modal */}
            <View style={[styles.tabsRow, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
                  setActiveTab('filters');
                }}
                style={[
                  styles.tabBtn,
                  activeTab === 'filters' && [styles.activeTabBtn, { backgroundColor: colors.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: activeTab === 'filters' ? colors.text : colors.textMuted },
                  ]}
                >
                  Filtros
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
                  setActiveTab('periods');
                }}
                style={[
                  styles.tabBtn,
                  activeTab === 'periods' && [styles.activeTabBtn, { backgroundColor: colors.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: activeTab === 'periods' ? colors.text : colors.textMuted },
                  ]}
                >
                  Meses ({timePeriods.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
                  setActiveTab('folders');
                }}
                style={[
                  styles.tabBtn,
                  activeTab === 'folders' && [styles.activeTabBtn, { backgroundColor: colors.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: activeTab === 'folders' ? colors.text : colors.textMuted },
                  ]}
                >
                  Carpetas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenido scrolleable */}
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
              {activeTab === 'filters' && (
                <View style={styles.optionsList}>
                  {FILTER_OPTIONS.map((item) => {
                    const isSelected = !selectedPeriod && !selectedAlbum && activeFilter === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          haptics.selection();
                          setFilter(item.id);
                          onClose();
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: isSelected ? colors.tagBg : 'transparent',
                            borderColor: isSelected ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.iconWrapper,
                              {
                                backgroundColor: isSelected
                                  ? colors.tagBg
                                  : colors.surfaceSubtle,
                              },
                            ]}
                          >
                            {renderIcon(item.id, isSelected)}
                          </View>
                          <View style={styles.optionTextCol}>
                            <Text
                              style={[
                                styles.optionLabel,
                                {
                                  color: isSelected ? colors.text : colors.textSecondary,
                                  fontWeight: isSelected ? '700' : '500',
                                },
                              ]}
                            >
                              {item.label}
                            </Text>
                            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                              {item.description}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeTab === 'periods' && (
                <View style={styles.optionsList}>
                  {timePeriods.map((period) => {
                    const isSelected = selectedPeriod?.key === period.key;
                    return (
                      <TouchableOpacity
                        key={period.key}
                        onPress={() => {
                          haptics.selection();
                          selectPeriodForReview(period);
                          onClose();
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: isSelected ? colors.tagBg : 'transparent',
                            borderColor: isSelected ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.iconWrapper,
                              {
                                backgroundColor: isSelected
                                  ? colors.tagBg
                                  : colors.surfaceSubtle,
                              },
                            ]}
                          >
                            <Calendar size={18} color={isSelected ? colors.primary : colors.accent} />
                          </View>
                          <View style={styles.optionTextCol}>
                            <Text
                              style={[
                                styles.optionLabel,
                                {
                                  color: isSelected ? colors.text : colors.textSecondary,
                                  fontWeight: isSelected ? '700' : '500',
                                },
                              ]}
                            >
                              {period.label}
                            </Text>
                            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                              {period.count} elementos · {formatBytes(period.totalBytes)}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeTab === 'folders' && (
                <View style={styles.optionsList}>
                  {/* Cámara Principal */}
                  <TouchableOpacity
                    onPress={() => {
                      haptics.selection();
                      selectAlbumForReview(cameraAlbum);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          selectedAlbum?.id === cameraAlbum.id ? colors.tagBg : 'transparent',
                        borderColor:
                          selectedAlbum?.id === cameraAlbum.id ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconWrapper,
                          { backgroundColor: colors.surfaceSubtle },
                        ]}
                      >
                        <Camera size={18} color={colors.primary} />
                      </View>
                      <View style={styles.optionTextCol}>
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color: selectedAlbum?.id === cameraAlbum.id ? colors.text : colors.textSecondary,
                              fontWeight: selectedAlbum?.id === cameraAlbum.id ? '700' : '500',
                            },
                          ]}
                        >
                          {cameraAlbum.title}
                        </Text>
                        <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                          {cameraAlbum.assetCount} fotos y videos sin clasificar
                        </Text>
                      </View>
                    </View>

                    {selectedAlbum?.id === cameraAlbum.id && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Check size={13} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Resto de carpetas */}
                  {otherAlbums.map((album) => {
                    const isSelected = selectedAlbum?.id === album.id;
                    return (
                      <TouchableOpacity
                        key={album.id}
                        onPress={() => {
                          haptics.selection();
                          selectAlbumForReview(album);
                          onClose();
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: isSelected ? colors.tagBg : 'transparent',
                            borderColor: isSelected ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.iconWrapper,
                              { backgroundColor: colors.surfaceSubtle },
                            ]}
                          >
                            <Folder size={18} color={colors.accent} />
                          </View>
                          <View style={styles.optionTextCol}>
                            <Text
                              style={[
                                styles.optionLabel,
                                {
                                  color: isSelected ? colors.text : colors.textSecondary,
                                  fontWeight: isSelected ? '700' : '500',
                                },
                              ]}
                            >
                              {album.title}
                            </Text>
                            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                              {album.assetCount} archivos organizados
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </GlassView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
  },
  glassCard: {
    padding: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    borderRadius: 13,
    borderWidth: 1,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    maxHeight: 380,
  },
  optionsList: {
    gap: 7,
    paddingBottom: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
});
