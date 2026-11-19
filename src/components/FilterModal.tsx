import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { FilterType } from '@/types/media';
import { FILTER_OPTIONS } from '@/constants/filters';
import { useSettings } from '@/context/SettingsContext';
import { GlassView } from './GlassView';
import { Sparkles, FolderClock, Video, Shuffle, Layers, Check, X } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  activeFilter: FilterType;
  onSelect: (filter: FilterType) => void;
  onClose: () => void;
}

export function FilterModal({ visible, activeFilter, onSelect, onClose }: FilterModalProps) {
  const { colors, haptics } = useSettings();

  const renderIcon = (id: FilterType, isSelected: boolean) => {
    const iconColor = isSelected ? colors.accent : colors.textSecondary;
    const size = 20;
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
            style={[styles.glassCard, { borderColor: colors.borderGlow }]}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Filtrar Galería</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Selecciona el modo de revisión
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
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Opciones */}
            <View style={styles.optionsList}>
              {FILTER_OPTIONS.map((item) => {
                const isSelected = activeFilter === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      haptics.selection();
                      onSelect(item.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: isSelected ? 'rgba(100, 210, 255, 0.12)' : 'transparent',
                        borderColor: isSelected ? colors.accent : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconWrapper,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(100, 210, 255, 0.2)'
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
                            { color: isSelected ? colors.text : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
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
                      <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                        <Check size={14} color="#000000" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  glassCard: {
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
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
    fontSize: 15,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
