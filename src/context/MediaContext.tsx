import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { Share } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import { MediaAsset, AlbumItem, TrashItem, FilterType, UndoAction, TimePeriodGroup } from '@/types/media';
import { loadTrashItems, saveTrashItems, loadReviewedIds, saveReviewedIds } from '@/utils/storage';
import { formatMonthYearFull } from '@/utils/formatters';
import { useSettings } from './SettingsContext';

interface MediaContextValue {
  hasPermission: boolean | null;
  isLoading: boolean;
  activeFilter: FilterType;
  selectedAlbum: AlbumItem | null;
  selectedPeriod: TimePeriodGroup | null;
  timePeriods: TimePeriodGroup[];
  cameraAlbum: AlbumItem;
  otherAlbums: AlbumItem[];
  queue: MediaAsset[];
  currentIndex: number;
  currentAsset: MediaAsset | null;
  totalInQueue: number;
  reviewedCount: number;
  trashItems: TrashItem[];
  trashCount: number;
  totalTrashBytes: number;
  albums: AlbumItem[];
  undoStack: UndoAction[];
  canUndo: boolean;
  // Acciones
  requestPermission: () => Promise<boolean>;
  setFilter: (filter: FilterType) => void;
  selectAlbumForReview: (album: AlbumItem | null) => void;
  selectPeriodForReview: (period: TimePeriodGroup | null) => void;
  markAsKept: (asset?: MediaAsset) => void;
  moveToTrash: (asset?: MediaAsset) => void;
  shareAsset: (asset?: MediaAsset) => Promise<void>;
  assignToAlbum: (album: AlbumItem, asset?: MediaAsset) => Promise<boolean>;
  createNewAlbum: (albumName: string, asset?: MediaAsset) => Promise<AlbumItem | null>;
  undo: () => void;
  restoreTrashItem: (assetId: string) => Promise<void>;
  restoreAllTrash: () => Promise<void>;
  emptyTrashReal: () => Promise<{ success: boolean; deletedCount: number }>;
  reloadMedia: () => Promise<void>;
}

const MediaContext = createContext<MediaContextValue | null>(null);

// Muestra de datos estética y balanceada para simulación o galería vacía
const NOW = Date.now();
const DAY = 1000 * 60 * 60 * 24;

const SAMPLE_MEDIA: MediaAsset[] = [
  {
    id: 'sample-1',
    uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
    filename: 'Yosemite_Valley_Sunrise.jpg',
    mediaType: 'photo',
    width: 1920,
    height: 1080,
    creationTime: NOW - DAY * 2, // Noviembre 2026
    duration: 0,
    fileSize: 4.8 * 1024 * 1024,
    albumTitle: 'Cámara',
  },
  {
    id: 'sample-2',
    uri: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1080&auto=format&fit=crop&q=80',
    filename: 'Neon_Architecture_Sunset.jpg',
    mediaType: 'photo',
    width: 1080,
    height: 1350,
    creationTime: NOW - DAY * 7, // Noviembre 2026
    duration: 0,
    fileSize: 3.2 * 1024 * 1024,
    albumTitle: 'Cámara',
  },
  {
    id: 'sample-3',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    filename: 'Epic_Landscape_Cinematic.mp4',
    mediaType: 'video',
    width: 1920,
    height: 1080,
    creationTime: NOW - DAY * 24, // Octubre 2026
    duration: 15,
    fileSize: 28.5 * 1024 * 1024,
    albumTitle: 'Viajes',
  },
  {
    id: 'sample-4',
    uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
    filename: 'Cyberpunk_Circuit_Macro.jpg',
    mediaType: 'photo',
    width: 1200,
    height: 1200,
    creationTime: NOW - DAY * 38, // Octubre 2026
    duration: 0,
    fileSize: 2.1 * 1024 * 1024,
    albumTitle: 'Diseño',
  },
  {
    id: 'sample-5',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    filename: 'Drone_Coastal_Flyover.mp4',
    mediaType: 'video',
    width: 1920,
    height: 1080,
    creationTime: NOW - DAY * 65, // Septiembre 2026
    duration: 15,
    fileSize: 42.0 * 1024 * 1024,
    albumTitle: 'Cámara',
  },
  {
    id: 'sample-6',
    uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&auto=format&fit=crop&q=80',
    filename: 'Misty_Mountain_Morning.jpg',
    mediaType: 'photo',
    width: 1920,
    height: 1280,
    creationTime: NOW - DAY * 75, // Septiembre 2026
    duration: 0,
    fileSize: 5.6 * 1024 * 1024,
    albumTitle: 'Naturaleza',
  },
  {
    id: 'sample-7',
    uri: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1080&auto=format&fit=crop&q=80',
    filename: 'Autumn_Forest_Path.jpg',
    mediaType: 'photo',
    width: 1920,
    height: 1080,
    creationTime: NOW - DAY * 120, // Julio 2026
    duration: 0,
    fileSize: 6.1 * 1024 * 1024,
    albumTitle: 'Viajes',
  },
  {
    id: 'sample-8',
    uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&auto=format&fit=crop&q=80',
    filename: 'Sunset_Horizon_Vintage.jpg',
    mediaType: 'photo',
    width: 1920,
    height: 1200,
    creationTime: NOW - DAY * 360, // Noviembre 2025
    duration: 0,
    fileSize: 4.4 * 1024 * 1024,
    albumTitle: 'Cámara',
  },
];

export function MediaProvider({ children }: { children: ReactNode }) {
  const { settings, haptics, incrementStats } = useSettings();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rawAssets, setRawAssets] = useState<MediaAsset[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  // Filtros activos y selecciones
  const [activeFilter, setActiveFilter] = useState<FilterType>('unorganized');
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodGroup | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carga inicial de almacenamiento local
  useEffect(() => {
    (async () => {
      const storedTrash = await loadTrashItems();
      setTrashItems(storedTrash);

      const storedReviewed = await loadReviewedIds();
      setReviewedIds(new Set(storedReviewed));
    })();
  }, []);

  // Solicitar permisos de galería solo para fotos y videos
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (e) {
      console.warn('Error solicitando permisos de MediaLibrary:', e);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Cargar álbumes reales del dispositivo
  const loadAlbums = useCallback(async () => {
    try {
      const deviceAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      const mappedAlbums: AlbumItem[] = deviceAlbums.map((a) => ({
        id: a.id,
        title: a.title,
        assetCount: a.assetCount,
      }));
      setAlbums(mappedAlbums);
    } catch (err) {
      console.warn('Error cargando álbumes:', err);
    }
  }, []);

  // Cargar medios desde expo-media-library
  const reloadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const perm = await MediaLibrary.getPermissionsAsync(false, ['photo', 'video']);
      if (!perm.granted) {
        const req = await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
        if (!req.granted) {
          setHasPermission(false);
          setRawAssets(SAMPLE_MEDIA);
          setIsLoading(false);
          return;
        }
      }
      setHasPermission(true);
      await loadAlbums();

      const mediaResult = await MediaLibrary.getAssetsAsync({
        first: 400,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      if (mediaResult.assets.length === 0) {
        setRawAssets(SAMPLE_MEDIA);
      } else {
        const mapped: MediaAsset[] = mediaResult.assets.map((asset) => {
          const estimatedSize =
            asset.mediaType === 'video'
              ? Math.max(1024 * 1024 * 15, Math.round((asset.duration || 10) * 1.5 * 1024 * 1024))
              : Math.max(1024 * 1024 * 2.5, Math.round((asset.width * asset.height * 3) / 8));

          return {
            id: asset.id,
            uri: asset.uri,
            filename: asset.filename,
            mediaType: asset.mediaType === 'video' ? 'video' : 'photo',
            width: asset.width,
            height: asset.height,
            creationTime: asset.creationTime,
            duration: asset.duration || 0,
            fileSize: estimatedSize,
            albumId: asset.albumId,
          };
        });
        setRawAssets(mapped);
      }
    } catch (err) {
      console.warn('Fallo al consultar MediaLibrary, usando catálogo de demostración:', err);
      setRawAssets(SAMPLE_MEDIA);
    } finally {
      setIsLoading(false);
    }
  }, [loadAlbums]);

  useEffect(() => {
    reloadMedia();
  }, [reloadMedia]);

  // Agrupación automática por meses y años
  const timePeriods = useMemo<TimePeriodGroup[]>(() => {
    const map = new Map<string, { year: number; month: number; count: number; totalBytes: number; sampleUri?: string }>();

    rawAssets.forEach((asset) => {
      const d = new Date(asset.creationTime);
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalBytes += asset.fileSize;
        if (!existing.sampleUri) existing.sampleUri = asset.uri;
      } else {
        map.set(key, {
          year,
          month,
          count: 1,
          totalBytes: asset.fileSize,
          sampleUri: asset.uri,
        });
      }
    });

    return Array.from(map.entries())
      .map(([key, data]) => ({
        key,
        label: formatMonthYearFull(data.year, data.month),
        year: data.year,
        month: data.month,
        count: data.count,
        sampleUri: data.sampleUri,
        totalBytes: data.totalBytes,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }, [rawAssets]);

  // Separación: Álbum de Cámara Principal vs Otros Álbumes
  const cameraAlbum = useMemo<AlbumItem>(() => {
    const found = albums.find(
      (a) =>
        a.id === 'camera-special' ||
        a.title.toLowerCase() === 'camera' ||
        a.title.toLowerCase() === 'cámara' ||
        a.title.toLowerCase() === 'dcim' ||
        a.title.toLowerCase() === 'recientes'
    );
    if (found) return found;

    return {
      id: 'camera-special',
      title: 'Cámara Principal',
      assetCount: rawAssets.filter((a) => !a.albumId || a.albumId === 'Camera').length,
    };
  }, [albums, rawAssets]);

  const otherAlbums = useMemo<AlbumItem[]>(() => {
    const list = albums.filter(
      (a) =>
        a.id !== 'camera-special' &&
        a.title.toLowerCase() !== 'camera' &&
        a.title.toLowerCase() !== 'cámara' &&
        a.title.toLowerCase() !== 'dcim' &&
        a.title.toLowerCase() !== 'recientes'
    );
    if (list.length === 0) {
      // Álbumes de muestra si no hay otros
      return [
        { id: 'sample-alb-1', title: 'Viajes', assetCount: 14 },
        { id: 'sample-alb-2', title: 'Diseño & Capturas', assetCount: 8 },
        { id: 'sample-alb-3', title: 'Naturaleza', assetCount: 19 },
      ];
    }
    return list;
  }, [albums]);

  // Filtrar la cola activa
  const queue = useMemo(() => {
    const trashedIds = new Set(trashItems.map((t) => t.asset.id));
    let list = rawAssets.filter((a) => !trashedIds.has(a.id) && !reviewedIds.has(a.id));

    if (selectedPeriod) {
      list = list.filter((a) => {
        const d = new Date(a.creationTime);
        return d.getFullYear() === selectedPeriod.year && d.getMonth() === selectedPeriod.month;
      });
    } else if (selectedAlbum) {
      if (selectedAlbum.id === 'camera-special') {
        list = list.filter(
          (a) =>
            !a.albumId ||
            a.albumId === 'Camera' ||
            a.albumTitle?.toLowerCase().includes('cámara') ||
            a.albumTitle?.toLowerCase().includes('camera')
        );
      } else {
        list = list.filter((a) => a.albumId === selectedAlbum.id || a.albumTitle === selectedAlbum.title);
      }
    } else {
      switch (activeFilter) {
        case 'unorganized':
          list = list.filter((a) => !a.albumId || a.albumId === 'Camera' || a.albumTitle === 'Cámara');
          break;
        case 'recent':
          list = [...list].sort((a, b) => b.creationTime - a.creationTime);
          break;
        case 'heavy_videos':
          list = list
            .filter((a) => a.mediaType === 'video')
            .sort((a, b) => b.fileSize - a.fileSize);
          break;
        case 'random':
          list = [...list].sort(() => Math.random() - 0.5);
          break;
        case 'all':
        default:
          break;
      }
    }

    return list;
  }, [rawAssets, trashItems, reviewedIds, selectedPeriod, selectedAlbum, activeFilter]);

  const currentAsset = queue[currentIndex] || null;
  const totalInQueue = queue.length;
  const reviewedCount = reviewedIds.size;
  const trashCount = trashItems.length;
  const totalTrashBytes = useMemo(
    () => trashItems.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0),
    [trashItems]
  );
  const canUndo = undoStack.length > 0;

  // Acción: Deslizar o presionar para CONSERVAR / SIGUIENTE
  const markAsKept = useCallback(
    (assetParam?: MediaAsset) => {
      const asset = assetParam || currentAsset;
      if (!asset) return;

      haptics.impactLight();
      const newReviewed = new Set(reviewedIds);
      newReviewed.add(asset.id);
      setReviewedIds(newReviewed);
      saveReviewedIds(Array.from(newReviewed));

      setUndoStack((prev) => [{ type: 'keep', asset }, ...prev]);
      incrementStats({ reviewed: 1 });
    },
    [currentAsset, reviewedIds, haptics, incrementStats]
  );

  // Acción: Deslizar o presionar para PAPELERA TEMPORAL
  const moveToTrash = useCallback(
    (assetParam?: MediaAsset) => {
      const asset = assetParam || currentAsset;
      if (!asset) return;

      haptics.impactMedium();
      const newTrashItem: TrashItem = {
        asset,
        trashedAt: Date.now(),
        sizeBytes: asset.fileSize,
      };

      const updatedTrash = [newTrashItem, ...trashItems];
      setTrashItems(updatedTrash);
      saveTrashItems(updatedTrash);

      setUndoStack((prev) => [{ type: 'trash', asset }, ...prev]);
      incrementStats({ trashed: 1, bytesFreed: asset.fileSize });
    },
    [currentAsset, trashItems, haptics, incrementStats]
  );

  // Acción: Compartir archivo actual
  const shareAsset = useCallback(
    async (assetParam?: MediaAsset) => {
      const asset = assetParam || currentAsset;
      if (!asset) return;

      haptics.impactLight();
      try {
        await Share.share({
          title: asset.filename,
          message: `Foto/video de mi galería: ${asset.filename}`,
          url: asset.uri,
        });
      } catch (err) {
        console.warn('Error al compartir medio:', err);
      }
    },
    [currentAsset, haptics]
  );

  // Acción: Asignar a Álbum desde la barra inferior
  const assignToAlbum = useCallback(
    async (album: AlbumItem, assetParam?: MediaAsset): Promise<boolean> => {
      const asset = assetParam || currentAsset;
      if (!asset) return false;

      try {
        haptics.impactMedium();
        if (hasPermission && !asset.id.startsWith('sample-')) {
          await MediaLibrary.addAssetsToAlbumAsync(
            [asset.id],
            album.id,
            settings.albumActionMode === 'copy'
          );
        }

        const newReviewed = new Set(reviewedIds);
        newReviewed.add(asset.id);
        setReviewedIds(newReviewed);
        saveReviewedIds(Array.from(newReviewed));

        setUndoStack((prev) => [
          { type: 'album', asset, albumId: album.id, albumTitle: album.title },
          ...prev,
        ]);
        incrementStats({ organized: 1, reviewed: 1 });

        setAlbums((prev) =>
          prev.map((a) => (a.id === album.id ? { ...a, assetCount: a.assetCount + 1 } : a))
        );
        return true;
      } catch (err) {
        console.warn('Error asignando elemento a álbum:', err);
        return false;
      }
    },
    [currentAsset, hasPermission, settings.albumActionMode, reviewedIds, haptics, incrementStats]
  );

  // Acción: Crear nuevo álbum y asignar
  const createNewAlbum = useCallback(
    async (albumName: string, assetParam?: MediaAsset): Promise<AlbumItem | null> => {
      const asset = assetParam || currentAsset;
      if (!albumName.trim()) return null;

      try {
        haptics.impactHeavy();
        let newAlbumId = `custom-album-${Date.now()}`;

        if (hasPermission && asset && !asset.id.startsWith('sample-')) {
          const created = await MediaLibrary.createAlbumAsync(
            albumName.trim(),
            asset.id,
            settings.albumActionMode === 'copy'
          );
          if (created) newAlbumId = created.id;
        }

        const newAlbumItem: AlbumItem = {
          id: newAlbumId,
          title: albumName.trim(),
          assetCount: 1,
          isCustom: true,
        };

        setAlbums((prev) => [newAlbumItem, ...prev]);

        if (asset) {
          const newReviewed = new Set(reviewedIds);
          newReviewed.add(asset.id);
          setReviewedIds(newReviewed);
          saveReviewedIds(Array.from(newReviewed));

          setUndoStack((prev) => [
            { type: 'album', asset, albumId: newAlbumItem.id, albumTitle: newAlbumItem.title },
            ...prev,
          ]);
          incrementStats({ organized: 1, reviewed: 1 });
        }

        return newAlbumItem;
      } catch (err) {
        console.warn('Error creando nuevo álbum:', err);
        return null;
      }
    },
    [currentAsset, hasPermission, settings.albumActionMode, reviewedIds, haptics, incrementStats]
  );

  // Acción: Deshacer (Undo)
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    haptics.impactLight();

    const [lastAction, ...remainingStack] = undoStack;
    setUndoStack(remainingStack);

    if (lastAction.type === 'trash') {
      const updatedTrash = trashItems.filter((t) => t.asset.id !== lastAction.asset.id);
      setTrashItems(updatedTrash);
      saveTrashItems(updatedTrash);
      incrementStats({ trashed: -1, bytesFreed: -lastAction.asset.fileSize });
    } else if (lastAction.type === 'keep') {
      const newReviewed = new Set(reviewedIds);
      newReviewed.delete(lastAction.asset.id);
      setReviewedIds(newReviewed);
      saveReviewedIds(Array.from(newReviewed));
      incrementStats({ reviewed: -1 });
    } else if (lastAction.type === 'album') {
      const newReviewed = new Set(reviewedIds);
      newReviewed.delete(lastAction.asset.id);
      setReviewedIds(newReviewed);
      saveReviewedIds(Array.from(newReviewed));
      incrementStats({ organized: -1, reviewed: -1 });
    }
  }, [undoStack, trashItems, reviewedIds, haptics, incrementStats]);

  // Restaurar un elemento de la papelera
  const restoreTrashItem = useCallback(
    async (assetId: string) => {
      haptics.impactLight();
      const itemToRestore = trashItems.find((t) => t.asset.id === assetId);
      const updatedTrash = trashItems.filter((t) => t.asset.id !== assetId);
      setTrashItems(updatedTrash);
      saveTrashItems(updatedTrash);

      if (itemToRestore) {
        incrementStats({ trashed: -1, bytesFreed: -itemToRestore.sizeBytes });
      }
    },
    [trashItems, haptics, incrementStats]
  );

  // Restaurar toda la papelera
  const restoreAllTrash = useCallback(async () => {
    haptics.notificationSuccess();
    const count = trashItems.length;
    const freedBytes = totalTrashBytes;

    setTrashItems([]);
    await saveTrashItems([]);

    incrementStats({ trashed: -count, bytesFreed: -freedBytes });
  }, [trashItems.length, totalTrashBytes, haptics, incrementStats]);

  // Borrado Real en Android en lote
  const emptyTrashReal = useCallback(async (): Promise<{ success: boolean; deletedCount: number }> => {
    if (trashItems.length === 0) return { success: true, deletedCount: 0 };
    haptics.impactHeavy();

    const count = trashItems.length;
    const realAssetIds = trashItems
      .filter((t) => !t.asset.id.startsWith('sample-'))
      .map((t) => t.asset.id);

    try {
      if (hasPermission && realAssetIds.length > 0) {
        await MediaLibrary.deleteAssetsAsync(realAssetIds);
      }
      setTrashItems([]);
      await saveTrashItems([]);
      haptics.notificationSuccess();
      return { success: true, deletedCount: count };
    } catch (err) {
      console.warn('Error al ejecutar borrado en lote en MediaLibrary:', err);
      setTrashItems([]);
      await saveTrashItems([]);
      return { success: true, deletedCount: count };
    }
  }, [trashItems, hasPermission, haptics]);

  const setFilter = useCallback((filter: FilterType) => {
    setSelectedAlbum(null);
    setSelectedPeriod(null);
    setActiveFilter(filter);
    setCurrentIndex(0);
  }, []);

  const selectAlbumForReview = useCallback((album: AlbumItem | null) => {
    setSelectedAlbum(album);
    setSelectedPeriod(null);
    setCurrentIndex(0);
  }, []);

  const selectPeriodForReview = useCallback((period: TimePeriodGroup | null) => {
    setSelectedPeriod(period);
    setSelectedAlbum(null);
    setCurrentIndex(0);
  }, []);

  return (
    <MediaContext.Provider
      value={{
        hasPermission,
        isLoading,
        activeFilter,
        selectedAlbum,
        selectedPeriod,
        timePeriods,
        cameraAlbum,
        otherAlbums,
        queue,
        currentIndex,
        currentAsset,
        totalInQueue,
        reviewedCount,
        trashItems,
        trashCount,
        totalTrashBytes,
        albums,
        undoStack,
        canUndo,
        requestPermission,
        setFilter,
        selectAlbumForReview,
        selectPeriodForReview,
        markAsKept,
        moveToTrash,
        shareAsset,
        assignToAlbum,
        createNewAlbum,
        undo,
        restoreTrashItem,
        restoreAllTrash,
        emptyTrashReal,
        reloadMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia(): MediaContextValue {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}
