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
import { SourceGridModal } from './SourceGridModal';
import { GlassView } from './GlassView';
import { formatDateMonthYear, formatBytes } from '@/utils/formatters';
import {
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  CheckCheck,
  Calendar,
  Folder,
  Layers,
  ArrowLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';

interface TopHeaderProps {
  onOpenBatchSummary?: () => void;
  showBackButton?: boolean;
}

export function TopHeader({ onOpenBatchSummary, showBackButton }: TopHeaderProps) {
  const { colors, haptics, settings } = useSettings();
  const {
    activeSourceTitle,
    activeSourceType,
    currentIndex,
    totalInQueue,
    currentAsset,
    pendingCount,
    undo,
    canUndo,
    undoStack,
  } = useMedia();

  const [sourceGridVisible, setSourceGridVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Fecha legible del archivo actual
  const dateFormatted = currentAsset ? formatDateMonthYear(currentAsset.creationTime) : '';

  // Espacio total liberado acumulado (asegurado no negativo)
  const freedFormatted = formatBytes(Math.max(0, settings.stats?.totalBytesFreed || 0));

  const renderSourceIcon = () => {
    switch (activeSourceType) {
      case 'period':
        return <Calendar size={13} color={colors.primary} />;
      case 'album':
        return <Folder size={13} color={colors.accent} />;
      case 'filter':
      default:
        return <Layers size={13} color={colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <GlassView
        intensity={35}
        borderRadius={24}
        style={[styles.headerCard, { borderColor: colors.border }]}
      >
        <View style={styles.topRow}>
          {/* Botón Volver o Deshacer */}
          {showBackButton ? (
            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                router.back();
              }}
              activeOpacity={0.7}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <ArrowLeft size={18} color={colors.text} />
            </TouchableOpacity>
          ) : (
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
          )}

          {/* Selector de Origen Central (NUNCA VACÍO - Abre Cuadrícula de Miniaturas) */}
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setSourceGridVisible(true);
            }}
            activeOpacity={0.8}
            style={[
              styles.filterSelector,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            {renderSourceIcon()}
            <Text
              style={[styles.filterText, { color: colors.text }]}
              numberOfLines={1}
            >
              {activeSourceTitle || 'Sin ordenar'}
            </Text>
            <ChevronDown size={14} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Acciones Derecha: Botón Lote ¡Listo! + Ajustes */}
          <View style={styles.rightActions}>
            {/* Si showBackButton es true, dejamos el botón Deshacer a la derecha antes de Ajustes */}
            {showBackButton && canUndo && (
              <TouchableOpacity
                onPress={undo}
                activeOpacity={0.7}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    borderColor: colors.amber,
                  },
                ]}
              >
                <RotateCcw size={16} color={colors.amber} strokeWidth={2.2} />
              </TouchableOpacity>
            )}

            {/* Botón ¡Listo! de Lote Pendiente */}
            {pendingCount > 0 && onOpenBatchSummary && (
              <TouchableOpacity
                onPress={() => {
                  haptics.impactMedium();
                  onOpenBatchSummary();
                }}
                activeOpacity={0.8}
                style={[
                  styles.batchBtn,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <CheckCheck size={14} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                <Text
                  style={[
                    styles.batchBtnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  ¡Listo! ({pendingCount})
                </Text>
              </TouchableOpacity>
            )}

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

      {/* Modal de Cuadrícula de Miniaturas del origen activo */}
      <SourceGridModal
        visible={sourceGridVisible}
        onClose={() => setSourceGridVisible(false)}
        onChangeSource={() => setFilterModalVisible(true)}
      />

      {/* Modal para cambiar origen (Filtros, Meses o Carpetas) */}
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
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    gap: 5,
  },
  batchBtnText: {
    fontSize: 12,
    fontWeight: '800',
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
