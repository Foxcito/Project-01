import { FilterOption } from '@/types/media';

export const FILTER_OPTIONS: FilterOption[] = [
  {
    id: 'unorganized',
    label: 'Sin ordenar',
    description: 'Fotos y videos que no pertenecen a ningún álbum creado',
    iconName: 'folder-clock',
  },
  {
    id: 'recent',
    label: 'Más recientes',
    description: 'Elementos ordenados desde el más nuevo al más antiguo',
    iconName: 'sparkles',
  },
  {
    id: 'heavy_videos',
    label: 'Videos pesados',
    description: 'Videos ordenados por tamaño para liberar almacenamiento rápido',
    iconName: 'video',
  },
  {
    id: 'random',
    label: 'Aleatorio',
    description: 'Descubre recuerdos dispersos en orden aleatorio',
    iconName: 'shuffle',
  },
  {
    id: 'all',
    label: 'Todos los elementos',
    description: 'Revisa toda tu galería sin restricciones',
    iconName: 'layers',
  },
];
