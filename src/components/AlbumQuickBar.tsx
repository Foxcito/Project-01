import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useMedia } from '@/context/MediaContext';
import { useSettings } from '@/context/SettingsContext';
import { GlassView } from './GlassView';
import { CreateAlbumModal } from './CreateAlbumModal';
import { Folder, FolderPlus, Sparkles } from 'lucide-react-native';

export function AlbumQuickBar() {
  const { colors, haptics, settings } = useSettings();
  const { albums, currentAsset, assignToAlbum, createNewAlbum } = useMedia();
  const [modalVisible, setModalVisible] = useState(false);

  if (!currentAsset) return null;

  return (
    <View style={styles.container}>
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
            intensity={30}
            borderRadius={16}
            style={[
              styles.albumChip,
              {
                backgroundColor: 'rgba(10, 132, 255, 0.15)',
                borderColor: colors.primary,
              },
            ]}
          >
            <FolderPlus size={16} color={colors.primary} />
            <Text style={[styles.albumTitle, { color: colors.primary, fontWeight: '700' }]}>
              + Nuevo
            </Text>
          </GlassView>
        </TouchableOpacity>

        {/* Lista de Carpetas / Álbumes existentes */}
        {albums.map((album) => (
          <TouchableOpacity
            key={album.id}
            onPress={async () => {
              await assignToAlbum(album);
            }}
            activeOpacity={0.75}
          >
            <GlassView
              intensity={25}
              borderRadius={16}
              style={[
                styles.albumChip,
                {
                  borderColor: colors.border,
                },
              ]}
            >
              <Folder size={15} color={colors.accent} />
              <Text
                style={[styles.albumTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {album.title}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.countText, { color: colors.textSecondary }]}>
                  {album.assetCount}
                </Text>
              </View>
            </GlassView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal para crear álbum nuevo */}
      <CreateAlbumModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={async (name) => {
          await createNewAlbum(name);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
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
    paddingVertical: 8,
    gap: 8,
  },
  albumTitle: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 110,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
