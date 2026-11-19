import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { GlassView } from '@/components/GlassView';
import { CreateAlbumModal } from '@/components/CreateAlbumModal';
import { AlbumItem } from '@/types/media';
import { Folder, FolderPlus, Play, Sparkles, Layers } from 'lucide-react-native';
import { router } from 'expo-router';

type AlbumTab = 'organized' | 'unorganized';

export default function AlbumsScreen() {
  const { colors, haptics } = useSettings();
  const { albums, selectAlbumForReview, setFilter, createNewAlbum } = useMedia();

  const [activeTab, setActiveTab] = useState<AlbumTab>('organized');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Separar álbumes: Organizados (carpetas con nombre) vs Sin organizar
  const organizedAlbums = albums.filter((a) => a.title.toLowerCase() !== 'camera');
  const unorganizedCount = albums.find((a) => a.title.toLowerCase() === 'camera')?.assetCount || 0;

  const handleReviewAlbum = (album: AlbumItem) => {
    haptics.impactLight();
    selectAlbumForReview(album);
    router.replace('/');
  };

  const handleReviewUnorganized = () => {
    haptics.impactLight();
    setFilter('unorganized');
    router.replace('/');
  };

  const renderAlbumCard = ({ item }: { item: AlbumItem }) => (
    <GlassView
      intensity={25}
      borderRadius={20}
      style={[styles.albumCard, { borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceSubtle }]}>
          <Folder size={22} color={colors.accent} />
        </View>
        <View style={styles.albumMeta}>
          <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.albumCount, { color: colors.textSecondary }]}>
            {item.assetCount} {item.assetCount === 1 ? 'archivo' : 'archivos'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleReviewAlbum(item)}
        activeOpacity={0.8}
        style={[styles.reviewBtn, { backgroundColor: 'rgba(10, 132, 255, 0.15)', borderColor: colors.primary }]}
      >
        <Play size={13} color={colors.primary} fill={colors.primary} />
        <Text style={[styles.reviewBtnText, { color: colors.primary }]}>Revisar Álbum</Text>
      </TouchableOpacity>
    </GlassView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Álbumes</Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              Organiza tus fotos por carpetas
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setCreateModalVisible(true);
            }}
            activeOpacity={0.8}
            style={[styles.newAlbumBtn, { backgroundColor: colors.primary }]}
          >
            <FolderPlus size={16} color="#FFFFFF" />
            <Text style={styles.newAlbumBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de pestañas: Organizados vs Sin organizar */}
        <View style={[styles.tabSegmentContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setActiveTab('organized');
            }}
            style={[
              styles.tabSegment,
              activeTab === 'organized' && [styles.activeTabSegment, { backgroundColor: colors.surface }],
            ]}
          >
            <Text
              style={[
                styles.tabSegmentText,
                { color: activeTab === 'organized' ? colors.text : colors.textMuted },
              ]}
            >
              Organizados ({organizedAlbums.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setActiveTab('unorganized');
            }}
            style={[
              styles.tabSegment,
              activeTab === 'unorganized' && [styles.activeTabSegment, { backgroundColor: colors.surface }],
            ]}
          >
            <Text
              style={[
                styles.tabSegmentText,
                { color: activeTab === 'unorganized' ? colors.text : colors.textMuted },
              ]}
            >
              Sin organizar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según pestaña */}
        {activeTab === 'organized' ? (
          <FlatList
            data={organizedAlbums}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbumCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Folder size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No tienes álbumes organizados aún.
                </Text>
                <TouchableOpacity
                  onPress={() => setCreateModalVisible(true)}
                  style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.emptyActionBtnText}>Crear Primer Álbum</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <View style={styles.unorganizedContainer}>
            <GlassView intensity={30} borderRadius={24} style={[styles.unorganizedCard, { borderColor: colors.border }]}>
              <View style={[styles.unorganizedIconCircle, { backgroundColor: 'rgba(255, 159, 10, 0.15)' }]}>
                <Layers size={36} color={colors.amber} />
              </View>
              <Text style={[styles.unorganizedTitle, { color: colors.text }]}>
                Fotos y Videos Sin Álbum
              </Text>
              <Text style={[styles.unorganizedDesc, { color: colors.textSecondary }]}>
                Archivos en la cámara principal que aún no han sido clasificados en ninguna carpeta.
              </Text>

              <TouchableOpacity
                onPress={handleReviewUnorganized}
                activeOpacity={0.8}
                style={[styles.startReviewBtn, { backgroundColor: colors.amber }]}
              >
                <Play size={16} color="#000000" fill="#000000" />
                <Text style={styles.startReviewBtnText}>Revisar Sin Organizar</Text>
              </TouchableOpacity>
            </GlassView>
          </View>
        )}
      </View>

      <CreateAlbumModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={async (name) => {
          await createNewAlbum(name);
        }}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  newAlbumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  newAlbumBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tabSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabSegmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 90,
    gap: 12,
  },
  albumCard: {
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumMeta: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  albumCount: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  unorganizedContainer: {
    flex: 1,
    paddingTop: 20,
  },
  unorganizedCard: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
  },
  unorganizedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  unorganizedTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  unorganizedDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  startReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  startReviewBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
