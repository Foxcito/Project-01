import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useMedia } from '@/context/MediaContext';
import { useSettings } from '@/context/SettingsContext';
import { GlassView } from './GlassView';
import { CreateAlbumModal } from './CreateAlbumModal';
import { AlbumItem } from '@/types/media';
import { Folder, FolderPlus, Check, FolderInput } from 'lucide-react-native';

export function AlbumQuickBar() {
  const { colors, haptics, settings } = useSettings();
  const { albums, currentAsset, assignToAlbum, createNewAlbum } = useMedia();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDestAlbum, setSelectedDestAlbum] = useState<AlbumItem | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!currentAsset) return null;

  const handleApply = async () => {
    if (!selectedDestAlbum) return;
    setIsApplying(true);
    await assignToAlbum(selectedDestAlbum);
    setIsApplying(false);
    setSelectedDestAlbum(null);
  };

  return (
    <View style={styles.container}>
      {/* Fila superior: Chip carrusel horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Botón "+ Nuevo Álbum" */}
        <TouchableOpacity
          onPress={() => {
            haptics.selection();
            setModalVisible(true);
          }}
          activeOpacity={0.75}
        >
          <GlassView
            intensity={35}
            borderRadius={16}
            style={[
              styles.albumChip,
              {
                backgroundColor: colors.tagBg,
                borderColor: colors.primary,
              },
            ]}
          >
            <FolderPlus size={15} color={colors.primary} />
            <Text style={[styles.albumTitle, { color: colors.primary, fontWeight: '700' }]}>
              + Nuevo
            </Text>
          </GlassView>
        </TouchableOpacity>

        {/* Lista de Carpetas con contador */}
        {albums.map((album) => {
          const isSelected = selectedDestAlbum?.id === album.id;
          return (
            <TouchableOpacity
              key={album.id}
              onPress={() => {
                haptics.selection();
                setSelectedDestAlbum(isSelected ? null : album);
              }}
              activeOpacity={0.75}
            >
              <GlassView
                intensity={30}
                borderRadius={16}
                style={[
                  styles.albumChip,
                  {
                    backgroundColor: isSelected ? colors.tagBg : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Folder size={14} color={isSelected ? colors.primary : colors.accent} />
                <Text
                  style={[
                    styles.albumTitle,
                    {
                      color: isSelected ? colors.text : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {album.title}
                </Text>

                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isSelected ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    {album.assetCount}
                  </Text>
                </View>

                {isSelected && (
                  <Check size={13} color={colors.primary} strokeWidth={3} />
                )}
              </GlassView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Botón de Aplicar / Asignar visible cuando una carpeta está seleccionada */}
      {selectedDestAlbum && (
        <View style={styles.applyContainer}>
          <TouchableOpacity
            onPress={handleApply}
            disabled={isApplying}
            activeOpacity={0.85}
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
          >
            {isApplying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <FolderInput size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                <Text
                  style={[
                    styles.applyBtnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  {settings.albumActionMode === 'move' ? 'Mover a' : 'Copiar a'}{' '}
                  "{selectedDestAlbum.title}"
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Modal para crear nuevo álbum */}
      <CreateAlbumModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={async (name) => {
          const created = await createNewAlbum(name);
          if (created) setSelectedDestAlbum(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 8,
    alignItems: 'center',
  },
  albumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 7,
    borderWidth: 1,
  },
  albumTitle: {
    fontSize: 12,
    maxWidth: 110,
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 7,
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
  },
  applyContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  applyBtn: {
    height: 40,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
