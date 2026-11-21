import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Sparkles,
  X,
  Trash2,
  Folder,
  CheckCircle2,
  CheckCheck,
} from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { formatBytes } from '@/utils/formatters';

interface BatchSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onApplySuccess?: () => void;
}

export function BatchSummaryModal({ visible, onClose, onApplySuccess }: BatchSummaryModalProps) {
  const { colors, haptics } = useSettings();
  const { batchSummary, applyBatchChanges, discardPendingBatch } = useMedia();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trashAssets, trashBytes, albumMoves, keptAssets, totalActions } = batchSummary;

  const handleApply = async () => {
    setIsSubmitting(true);
    haptics.impactHeavy();
    try {
      const res = await applyBatchChanges();
      if (res.success) {
        onClose();
        if (onApplySuccess) onApplySuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    haptics.impactMedium();
    discardPendingBatch();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView
          intensity={65}
          tint={colors.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: colors.tagBg }]}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
                  {totalActions} Acciones Pendientes
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>¡Listo para Aplicar!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Revisa el resumen de fotos y videos organizados antes de confirmar los cambios.
            </Text>
          </View>

          {/* Lista de Acciones Agrupadas */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Sección Papelera */}
            {trashAssets.length > 0 && (
              <View
                style={[
                  styles.summarySection,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.trashGlow,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                    <Trash2 size={18} color={colors.trash} />
                  </View>
                  <View style={styles.sectionHeaderText}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Enviar a Papelera
                    </Text>
                    <Text style={[styles.sectionMeta, { color: colors.trash }]}>
                      {trashAssets.length} archivos · {formatBytes(trashBytes)} recuperables
                    </Text>
                  </View>
                </View>

                {/* Tira de miniaturas de papelera */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
                  {trashAssets.slice(0, 10).map((asset) => (
                    <Image key={asset.id} source={{ uri: asset.uri }} style={styles.thumbImage} />
                  ))}
                  {trashAssets.length > 10 && (
                    <View style={[styles.thumbMore, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.thumbMoreText, { color: colors.textSecondary }]}>
                        +{trashAssets.length - 10}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Sección Mover / Asignar a Carpetas */}
            {albumMoves.map((group) => (
              <View
                key={group.album.id}
                style={[
                  styles.summarySection,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.tagBg }]}>
                    <Folder size={18} color={colors.primary} />
                  </View>
                  <View style={styles.sectionHeaderText}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Carpeta: {group.album.title}
                    </Text>
                    <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
                      {group.assets.length} elemento{group.assets.length > 1 ? 's' : ''} a organizar
                    </Text>
                  </View>
                </View>

                {/* Tira de miniaturas de carpeta */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
                  {group.assets.slice(0, 10).map((asset) => (
                    <Image key={asset.id} source={{ uri: asset.uri }} style={styles.thumbImage} />
                  ))}
                  {group.assets.length > 10 && (
                    <View style={[styles.thumbMore, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.thumbMoreText, { color: colors.textSecondary }]}>
                        +{group.assets.length - 10}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            ))}

            {/* Sección Conservados */}
            {keptAssets.length > 0 && (
              <View
                style={[
                  styles.summarySection,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.keepGlow,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <CheckCircle2 size={18} color={colors.keep} />
                  </View>
                  <View style={styles.sectionHeaderText}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Conservados</Text>
                    <Text style={[styles.sectionMeta, { color: colors.keep }]}>
                      {keptAssets.length} fotos y videos marcados para mantener
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {totalActions === 0 && (
              <View style={styles.emptyContainer}>
                <CheckCheck size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No hay acciones pendientes en el lote actual.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botones de Acción */}
          <View style={styles.footer}>
            {totalActions > 0 && (
              <TouchableOpacity
                onPress={handleApply}
                disabled={isSubmitting}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.isDark ? '#000000' : '#FFFFFF'} />
                ) : (
                  <>
                    <CheckCircle2
                      size={20}
                      color={colors.isDark ? '#000000' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { color: colors.isDark ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      Aplicar Cambios en Lote
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.secondaryRow}>
              {totalActions > 0 && (
                <TouchableOpacity
                  onPress={handleDiscard}
                  disabled={isSubmitting}
                  style={[styles.discardBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.discardBtnText, { color: colors.trash }]}>
                    Descartar Todo
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                style={[styles.closeModalBtn, { backgroundColor: colors.surfaceSubtle }]}
              >
                <Text style={[styles.closeModalBtnText, { color: colors.text }]}>
                  Continuar Revisando
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    paddingHorizontal: 20,
    maxHeight: 380,
  },
  summarySection: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  thumbRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  thumbImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 6,
  },
  thumbMore: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbMoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  discardBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  discardBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeModalBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  closeModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
