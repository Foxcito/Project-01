export type MediaType = 'photo' | 'video';

export interface MediaAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: MediaType;
  width: number;
  height: number;
  creationTime: number; // timestamp in ms
  duration: number;     // in seconds for video
  fileSize: number;     // in bytes
  albumId?: string;
  albumTitle?: string;
}

export interface AlbumItem {
  id: string;
  title: string;
  assetCount: number;
  posterUri?: string;
  isCustom?: boolean;
}

export interface TimePeriodGroup {
  key: string;       // e.g. "2026-10"
  label: string;     // e.g. "Octubre 2026"
  year: number;
  month: number;     // 0-indexed (0 = Enero, 11 = Diciembre)
  count: number;
  sampleUri?: string;
  totalBytes: number;
}

export interface TrashItem {
  asset: MediaAsset;
  trashedAt: number;
  sizeBytes: number;
}

export type FilterType = 'all' | 'unorganized' | 'recent' | 'heavy_videos' | 'random';

export interface FilterOption {
  id: FilterType;
  label: string;
  description: string;
  iconName: string;
}

export interface UndoAction {
  type: 'trash' | 'keep' | 'album';
  asset: MediaAsset;
  albumId?: string;
  albumTitle?: string;
}

export interface PendingBatchAction {
  id: string;
  type: 'trash' | 'keep' | 'album';
  asset: MediaAsset;
  targetAlbum?: AlbumItem;
}

export interface BatchSummary {
  trashAssets: MediaAsset[];
  trashBytes: number;
  albumMoves: { album: AlbumItem; assets: MediaAsset[] }[];
  keptAssets: MediaAsset[];
  totalActions: number;
}

export type ActiveSourceType = 'filter' | 'period' | 'album';

export interface SourceProgress {
  sourceKey: string;
  lastAssetId: string;
  lastIndex: number;
  updatedAt: number;
}

