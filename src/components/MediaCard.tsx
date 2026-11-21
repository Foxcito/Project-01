import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MediaAsset } from '@/types/media';
import { useSettings } from '@/context/SettingsContext';
import { formatBytes, formatDuration, formatDateTime } from '@/utils/formatters';
import { GlassView } from './GlassView';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Video as VideoIcon,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaCardProps {
  asset: MediaAsset;
  isActive: boolean;
  onZoomChange?: (isZoomed: boolean) => void;
}

export function MediaCard({ asset, isActive, onZoomChange }: MediaCardProps) {
  const { colors, settings, haptics } = useSettings();
  const [isMuted, setIsMuted] = useState(settings.defaultMuted);
  const [isPlaying, setIsPlaying] = useState(settings.autoplayVideos);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==========================================
  // GESTOS DE ZOOM Y PAN PARA FOTOS
  // ==========================================
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    if (onZoomChange) runOnJS(onZoomChange)(false);
  };

  // Reset al cambiar de asset o perder foco
  useEffect(() => {
    resetZoom();
  }, [asset.id, isActive]);

  // Gesto de doble toque (Zoom toggle 1x <-> 2.5x)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(asset.mediaType === 'photo' && isActive)
    .onEnd(() => {
      'worklet';
      if (scale.value > 1.2) {
        resetZoom();
      } else {
        scale.value = withSpring(2.5);
        if (onZoomChange) runOnJS(onZoomChange)(true);
      }
    });

  // Gesto de pellizco (Pinch)
  const pinchGesture = Gesture.Pinch()
    .enabled(asset.mediaType === 'photo' && isActive)
    .onStart(() => {
      'worklet';
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      'worklet';
      const nextScale = savedScale.value * event.scale;
      scale.value = Math.max(0.85, Math.min(nextScale, 4.0));
      if (scale.value > 1.05 && onZoomChange) {
        runOnJS(onZoomChange)(true);
      }
    })
    .onEnd(() => {
      'worklet';
      if (scale.value <= 1.05) {
        resetZoom();
      } else {
        scale.value = withSpring(Math.min(scale.value, 3.5));
      }
    });

  // Gesto de paneo interno en foto ampliada (solo con 1 dedo)
  const photoPanGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .enabled(asset.mediaType === 'photo' && isActive)
    .onStart(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (scale.value > 1.05) {
        const maxPanX = (SCREEN_WIDTH * (scale.value - 1)) / 1.8;
        const maxPanY = (SCREEN_HEIGHT * 0.55 * (scale.value - 1)) / 1.8;
        translateX.value = Math.max(
          -maxPanX,
          Math.min(maxPanX, savedTranslateX.value + event.translationX)
        );
        translateY.value = Math.max(
          -maxPanY,
          Math.min(maxPanY, savedTranslateY.value + event.translationY)
        );
      }
    })
    .onEnd(() => {
      'worklet';
      if (scale.value <= 1.05) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const photoComposedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Exclusive(doubleTapGesture, photoPanGesture)
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ==========================================
  // REPRODUCTOR DE VIDEO LIGERO Y SEGURO
  // ==========================================
  // Solo se crea e inicializa el reproductor si la tarjeta está activa
  const videoSourceUri = isActive && asset.mediaType === 'video' ? asset.uri : null;

  const player = useVideoPlayer(videoSourceUri, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.timeUpdateEventInterval = 0.25;
    if (isActive && settings.autoplayVideos) {
      p.play();
    } else {
      p.pause();
    }
  });

  useEffect(() => {
    if (!player || asset.mediaType !== 'video') return;

    player.muted = isMuted;

    if (isActive && settings.autoplayVideos) {
      player.play();
      setIsPlaying(true);
    } else {
      player.pause();
      setIsPlaying(false);
    }

    const timeSub = player.addListener('timeUpdate', (event) => {
      setCurrentTime(event.currentTime || 0);
    });

    const playingSub = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    return () => {
      timeSub.remove();
      playingSub.remove();
      player.pause();
    };
  }, [player, isActive, isMuted, asset.mediaType, settings.autoplayVideos]);

  const togglePlayPause = () => {
    if (!player) return;
    haptics.selection();
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      player.play();
      setIsPlaying(true);
      triggerAutoFadeControls();
    }
  };

  const toggleSound = () => {
    haptics.selection();
    setIsMuted((prev) => !prev);
  };

  const triggerAutoFadeControls = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  const handleSeek = (event: any) => {
    if (!player || !asset.duration) return;
    const { locationX } = event.nativeEvent;
    const barWidth = SCREEN_WIDTH - 80;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    const targetSeconds = ratio * asset.duration;
    player.currentTime = targetSeconds;
    setCurrentTime(targetSeconds);
    haptics.selection();
  };

  const isVintage = settings.theme === 'vintage';
  const dateTimeFormatted = formatDateTime(asset.creationTime);
  const videoProgressRatio = asset.duration ? Math.min(1, currentTime / asset.duration) : 0;

  return (
    <View
      style={[
        styles.cardInner,
        {
          backgroundColor: isVintage ? '#EFE8DE' : '#05070A',
          borderColor: colors.border,
          borderWidth: 1.5,
        },
      ]}
    >
      {asset.mediaType === 'photo' ? (
        <GestureDetector gesture={photoComposedGesture}>
          <Animated.View style={[styles.mediaContainer, animatedImageStyle]}>
            <Image
              source={{ uri: asset.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>
      ) : (
        <TouchableWithoutFeedback onPress={() => {
          setShowControls((prev) => !prev);
          if (!showControls) triggerAutoFadeControls();
        }}>
          <View style={styles.mediaContainer}>
            {isActive && player ? (
              <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
              />
            ) : (
              <Image
                source={{ uri: asset.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            {/* Controles de Video Superpuestos */}
            {isActive && showControls && (
              <View style={styles.videoControlsOverlay}>
                {/* Botón Central de Play/Pause */}
                <TouchableOpacity
                  onPress={togglePlayPause}
                  activeOpacity={0.8}
                  style={[
                    styles.centerPlayBtn,
                    {
                      backgroundColor: isVintage
                        ? 'rgba(42, 36, 30, 0.75)'
                        : 'rgba(0, 0, 0, 0.72)',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {isPlaying ? (
                    <Pause size={28} color="#FFFFFF" />
                  ) : (
                    <Play size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
                  )}
                </TouchableOpacity>

                {/* Barra Inferior de Video: Progreso y Tiempo */}
                <View style={styles.videoBottomControls}>
                  <GlassView
                    intensity={45}
                    borderRadius={16}
                    style={[styles.progressBarCard, { borderColor: colors.border }]}
                  >
                    <View style={styles.progressRow}>
                      <TouchableOpacity onPress={togglePlayPause} style={styles.playIconMini}>
                        {isPlaying ? (
                          <Pause size={14} color={colors.primary} />
                        ) : (
                          <Play size={14} color={colors.primary} fill={colors.primary} />
                        )}
                      </TouchableOpacity>

                      <TouchableWithoutFeedback onPress={handleSeek}>
                        <View style={styles.progressTrackWrapper}>
                          <View
                            style={[
                              styles.progressTrackBg,
                              { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                            ]}
                          >
                            <View
                              style={[
                                styles.progressTrackFill,
                                {
                                  width: `${videoProgressRatio * 100}%`,
                                  backgroundColor: colors.primary,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </TouchableWithoutFeedback>

                      <Text style={[styles.timeLabel, { color: colors.text }]}>
                        {formatDuration(Math.round(currentTime))} / {formatDuration(asset.duration)}
                      </Text>
                    </View>
                  </GlassView>
                </View>
              </View>
            )}

            {/* Botón flotante para Silenciar / Activar sonido */}
            <TouchableOpacity
              onPress={toggleSound}
              activeOpacity={0.8}
              style={[
                styles.audioToggleBtn,
                {
                  backgroundColor: isVintage
                    ? 'rgba(42, 36, 30, 0.75)'
                    : 'rgba(0, 0, 0, 0.72)',
                  borderColor: colors.border,
                },
              ]}
            >
              {isMuted ? (
                <VolumeX size={17} color="#FFFFFF" />
              ) : (
                <Volume2 size={17} color={colors.accent} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Overlay Superior: Fecha y hora exacta */}
      <View style={styles.topTimestampOverlay} pointerEvents="none">
        <GlassView
          intensity={40}
          borderRadius={14}
          style={[styles.timestampGlass, { borderColor: colors.border }]}
        >
          <View style={styles.timestampContent}>
            <Calendar size={12} color={colors.accent} />
            <Text style={[styles.timestampText, { color: colors.text }]}>
              {dateTimeFormatted}
            </Text>
          </View>
        </GlassView>
      </View>

      {/* Overlay Inferior: Badges de tamaño, tipo y álbum */}
      <View style={styles.bottomBadgesOverlay} pointerEvents="none">
        <GlassView
          intensity={45}
          borderRadius={12}
          style={[styles.badgeGlass, { borderColor: colors.border }]}
        >
          <View style={styles.badgeContent}>
            {asset.mediaType === 'video' ? (
              <VideoIcon size={12} color={colors.accent} />
            ) : (
              <ImageIcon size={12} color={colors.textSecondary} />
            )}
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {asset.mediaType === 'video'
                ? `${formatDuration(asset.duration)} · ${formatBytes(asset.fileSize)}`
                : formatBytes(asset.fileSize)}
            </Text>
          </View>
        </GlassView>

        {asset.albumTitle && (
          <GlassView
            intensity={45}
            borderRadius={12}
            style={[styles.badgeGlass, { borderColor: colors.border }]}
          >
            <Text style={[styles.badgeText, { color: colors.primary, fontWeight: '700' }]}>
              {asset.albumTitle}
            </Text>
          </GlassView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  centerPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  videoBottomControls: {
    position: 'absolute',
    bottom: 46,
    left: 12,
    right: 12,
  },
  progressBarCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playIconMini: {
    padding: 2,
  },
  progressTrackWrapper: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  progressTrackBg: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    width: '100%',
  },
  progressTrackFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '700',
    minWidth: 62,
    textAlign: 'right',
  },
  topTimestampOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 20,
  },
  timestampGlass: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
  },
  timestampContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  audioToggleBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 25,
  },
  bottomBadgesOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  badgeGlass: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
