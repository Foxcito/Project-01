import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { GlassView } from '@/components/GlassView';
import { formatBytes, formatDuration } from '@/utils/formatters';
import { TrashItem } from '@/types/media';
import {
  Trash2,
  RotateCcw,
  Video as VideoIcon,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react-native';

export default function TrashScreen() {
  const { colors, haptics } = useSettings();
  const {
    trashItems,
    totalTrashBytes,
    trashCount,
    restoreTrashItem,
    restoreAllTrash,
    emptyTrashReal,
  } = useMedia();

  const [isDeleting, setIsDeleting] = useState(false);

  const confirmEmptyTrash = () => {
    if (trashCount === 0) return;
    haptics.notificationWarning();

    Alert.alert(
      'Vaciar Papelera',
      `¿Deseas eliminar permanentemente estos ${trashCount} archivos (${formatBytes(totalTrashBytes)}) del almacenamiento de tu dispositivo? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar del Dispositivo',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const res = await emptyTrashReal();
            setIsDeleting(false);
            if (res.success) {
              Alert.alert('Completado', `Se liberaron ${formatBytes(totalTrashBytes)} exitosamente.`);
            }
          },
        },
      ]
    );
  };

  const confirmRestoreAll = () => {
    if (trashCount === 0) return;
    Alert.alert(
      'Restaurar Todo',
      `¿Quieres devolver los ${trashCount} elementos a tu galería?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            await restoreAllTrash();
          },
        },
      ]
    );
  };

  const renderTrashGridItem = ({ item }: { item: TrashItem }) => (
    <View style={styles.gridItemContainer}>
      <Image source={{ uri: item.asset.uri }} style={styles.gridThumbnail} resizeMode="cover" />

      {/* Indicador de Video o Tamaño */}
      <View style={styles.itemMetaBadge}>
        {item.asset.mediaType === 'video' && (
          <VideoIcon size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
        )}
        <Text style={styles.itemMetaText}>{formatBytes(item.sizeBytes)}</Text>
      </View>

      {/* Botón flotante para restaurar individualmente */}
      <TouchableOpacity
        onPress={() => restoreTrashItem(item.asset.id)}
        activeOpacity={0.8}
        style={[styles.restoreItemBtn, { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}
      >
        <RotateCcw size={14} color={colors.amber} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Papelera Temporal</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {trashCount} elementos · {formatBytes(totalTrashBytes)} listos para liberar
            </Text>
          </View>

          {trashCount > 0 && (
            <TouchableOpacity
              onPress={confirmRestoreAll}
              activeOpacity={0.7}
              style={[styles.restoreAllBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
            >
              <RotateCcw size={14} color={colors.textSecondary} />
              <Text style={[styles.restoreAllText, { color: colors.textSecondary }]}>Restaurar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Banner informativo de seguridad */}
        {trashCount > 0 && (
          <GlassView intensity={25} borderRadius={16} style={[styles.infoBanner, { borderColor: colors.border }]}>
            <AlertTriangle size={16} color={colors.amber} />
            <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
              Los archivos no se borran de tu teléfono hasta pulsar "Vaciar Papelera".
            </Text>
          </GlassView>
        )}

        {/* Cuadrícula de elementos */}
        <FlatList
          data={trashItems}
          keyExtractor={(item) => item.asset.id}
          renderItem={renderTrashGridItem}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                <CheckCheck size={44} color={colors.keep} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Papelera Limpia</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No hay fotos ni videos descartados en este momento.
              </Text>
            </View>
          }
        />

        {/* Botón inferior fijo para Vaciar Papelera en Lote */}
        {trashCount > 0 && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={confirmEmptyTrash}
              disabled={isDeleting}
              activeOpacity={0.85}
              style={[styles.emptyTrashBtn, { backgroundColor: colors.trash }]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Trash2 size={18} color="#FFFFFF" />
                  <Text style={styles.emptyTrashBtnText}>
                    Vaciar Papelera ({formatBytes(totalTrashBytes)})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  restoreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  restoreAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoBannerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  listContainer: {
    paddingBottom: 160,
  },
  columnWrapper: {
    gap: 8,
    marginBottom: 8,
  },
  gridItemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111',
  },
  gridThumbnail: {
    width: '100%',
    height: '100%',
  },
  itemMetaBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemMetaText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  restoreItemBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  emptyTrashBtn: {
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF453A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyTrashBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
