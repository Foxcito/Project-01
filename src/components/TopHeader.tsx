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
  Moon,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';

export function TopHeader() {
  const { colors, haptics, settings, toggleTheme } = useSettings();
  const {
    activeFilter,
    selectedAlbum,
    selectedPeriod,
    currentIndex,
    totalInQueue,
    currentAsset,
    trashCount,
    undo,
    canUndo,
    undoStack,
  } = useMedia();

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Etiqueta del filtro, período o álbum activo
  const filterLabel = selectedPeriod
    ? selectedPeriod.label
    : selectedAlbum
    ? selectedAlbum.title
    : FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label || 'Sin ordenar';

  // Fecha legible del archivo actual
  const dateFormatted = currentAsset ? formatDateMonthYear(currentAsset.creationTime) : '';

  // Espacio total liberado acumulado
  const freedFormatted = formatBytes(settings.stats.totalBytesFreed);

  return (
    <View style={styles.container}>
      <GlassView
        intensity={35}
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
                backgroundColor: canUndo ? 'rgba(245, 158, 11, 0.15)' : colors.surfaceSubtle,
                borderColor: canUndo ? colors.amber : 'transparent',
              },
            ]}
          >
            <RotateCcw
              size={17}
              color={canUndo ? colors.amber : colors.textMuted}
              strokeWidth={2.2}
            />
            {canUndo && (
              <View style={[styles.undoBadge, { backgroundColor: colors.amber }]}>
                <Text style={styles.undoBadgeText}>{undoStack.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Selector de Filtro / Período / Álbum Central */}
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setFilterModalVisible(true);
            }}
            activeOpacity={0.8}
            style={[
              styles.filterSelector,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.filterText, { color: colors.text }]}
              numberOfLines={1}
            >
              {filterLabel}
            </Text>
            <ChevronDown size={14} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Acciones Derecha: Alternar Tema Rápido + Papelera + Ajustes */}
          <View style={styles.rightActions}>
            {/* Alternador Rápido de Tema (Negro AMOLED vs Vintage Cálido) */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
              accessibilityLabel="Alternar Tema"
            >
              {settings.theme === 'oled' ? (
                <Sparkles size={17} color={colors.accent} />
              ) : (
                <Moon size={17} color={colors.primary} />
              )}
            </TouchableOpacity>

            {/* Acceso a Papelera */}
            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                router.push('/trash');
              }}
              activeOpacity={0.7}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Trash2 size={17} color={colors.textSecondary} />
              {trashCount > 0 && (
                <View style={[styles.trashBadge, { backgroundColor: colors.trash }]}>
                  <Text style={styles.trashBadgeText}>
                    {trashCount > 99 ? '99+' : trashCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Ajustes */}
            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                router.push('/settings');
              }}
              activeOpacity={0.7}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <SlidersHorizontal size={17} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fila Inferior: Contador de Progreso y Espacio Liberado */}
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
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
    zIndex: 50,
  },
  headerCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
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
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  trashBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  filterSelector: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    maxWidth: 130,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontWeight: '800',
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
