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
