import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useMedia } from '@/context/MediaContext';
import { useSettings } from '@/context/SettingsContext';
import { FilterModal } from './FilterModal';
import { GlassView } from './GlassView';
import { formatDateMonthYear, formatBytes } from '@/utils/formatters';
import { FILTER_OPTIONS } from '@/constants/filters';
import {
  RotateCcw,
  ChevronDown,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react-native';
import { router } from 'expo-router';

export function TopHeader() {
  const { colors, haptics, settings } = useSettings();
  const {
    activeFilter,
    selectedAlbum,
    setFilter,
    currentIndex,
    totalInQueue,
    reviewedCount,
    currentAsset,
    trashCount,
    undo,
    canUndo,
    undoStack,
  } = useMedia();

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Etiqueta del filtro o álbum activo
  const filterLabel = selectedAlbum
    ? selectedAlbum.title
    : FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label || 'Sin ordenar';

  // Fecha legible
  const dateFormatted = currentAsset ? formatDateMonthYear(currentAsset.creationTime) : '';

  // Espacio total liberado acumulado en sesión
  const freedFormatted = formatBytes(settings.stats.totalBytesFreed);

  return (
    <View style={styles.container}>
      <GlassView
        intensity={28}
        borderRadius={24}
        style={[styles.headerCard, { borderColor: colors.border }]}
      >
        <View style={styles.topRow}>
          {/* Botón Deshacer (Undo) */}
          <TouchableOpacity
            onPress={undo}
            disabled={!canUndo}
            activeOpacity={0.7}
            style={[
              styles.iconBtn,
              {
                backgroundColor: canUndo ? 'rgba(255, 159, 10, 0.15)' : colors.surfaceSubtle,
                borderColor: canUndo ? colors.amber : 'transparent',
              },
            ]}
          >
            <RotateCcw
              size={18}
              color={canUndo ? colors.amber : colors.textMuted}
              strokeWidth={2.2}
            />
            {canUndo && (
              <View style={[styles.undoBadge, { backgroundColor: colors.amber }]}>
                <Text style={styles.undoBadgeText}>{undoStack.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Selector de Filtro / Álbum Central */}
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setFilterModalVisible(true);
            }}
            activeOpacity={0.8}
            style={[styles.filterSelector, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
          >
            <Text
              style={[styles.filterText, { color: colors.text }]}
              numberOfLines={1}
            >
              {filterLabel}
            </Text>
            <ChevronDown size={15} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Iconos Derecha: Papelera con Badge + Configuración */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                router.push('/trash');
              }}
              activeOpacity={0.7}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Trash2 size={18} color={colors.textSecondary} />
              {trashCount > 0 && (
                <View style={[styles.trashBadge, { backgroundColor: colors.trash }]}>
                  <Text style={styles.trashBadgeText}>
                    {trashCount > 99 ? '99+' : trashCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                router.push('/settings');
              }}
              activeOpacity={0.7}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <SlidersHorizontal size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fila de Progreso y Estadísticas */}
        <View style={styles.statsRow}>
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            <Text style={[styles.highlightNumber, { color: colors.text }]}>
              {totalInQueue > 0 ? currentIndex + 1 : 0}
            </Text>{' '}
            / {totalInQueue}
            {dateFormatted ? ` · ${dateFormatted}` : ''}
          </Text>

          <View style={styles.freedContainer}>
            <View style={[styles.freedDot, { backgroundColor: colors.keep }]} />
            <Text style={[styles.freedText, { color: colors.keep }]}>
              {freedFormatted} liberados
            </Text>
          </View>
        </View>
      </GlassView>

      <FilterModal
        visible={filterModalVisible}
        activeFilter={activeFilter}
        onSelect={setFilter}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 50,
  },
  headerCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  undoBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  undoBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  trashBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  trashBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  filterSelector: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    maxWidth: 150,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  highlightNumber: {
    fontWeight: '700',
    fontSize: 13,
  },
  freedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  freedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  freedText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
