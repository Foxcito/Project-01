import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MediaAsset } from '@/types/media';
import { useSettings } from '@/context/SettingsContext';
import { formatBytes, formatDuration } from '@/utils/formatters';
import { GlassView } from './GlassView';
import { Volume2, VolumeX, Video as VideoIcon, Image as ImageIcon } from 'lucide-react-native';

interface MediaCardProps {
  asset: MediaAsset;
  isActive: boolean;
}

export function MediaCard({ asset, isActive }: MediaCardProps) {
  const { colors, settings, haptics } = useSettings();
  const [isMuted, setIsMuted] = useState(settings.defaultMuted);

  // Zoom de fotos con gesto de pellizco (Pinch-to-zoom)
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .enabled(asset.mediaType === 'photo')
    .onUpdate((event) => {
      'worklet';
      scale.value = Math.max(1, Math.min(event.scale, 3.5));
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);
    });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Controlador de video moderno con expo-video
  const player = useVideoPlayer(asset.mediaType === 'video' ? asset.uri : null, (p) => {
    p.loop = true;
    p.muted = isMuted;
    if (isActive && settings.autoplayVideos) {
      p.play();
    } else {
      p.pause();
    }
  });

  useEffect(() => {
    if (player && asset.mediaType === 'video') {
      player.muted = isMuted;
      if (isActive && settings.autoplayVideos) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, isMuted, player, asset.mediaType, settings.autoplayVideos]);

  const toggleSound = () => {
    haptics.selection();
    setIsMuted((prev) => !prev);
  };

  return (
    <View style={styles.cardInner}>
      {asset.mediaType === 'photo' ? (
        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={[styles.mediaContainer, animatedImageStyle]}>
            <Image
              source={{ uri: asset.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>
      ) : (
        <View style={styles.mediaContainer}>
          {player ? (
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

          {/* Botón flotante para Silenciar / Activar sonido */}
          <TouchableOpacity
            onPress={toggleSound}
            activeOpacity={0.8}
            style={[styles.audioToggleBtn, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]}
          >
            {isMuted ? (
              <VolumeX size={18} color="#FFFFFF" />
            ) : (
              <Volume2 size={18} color={colors.accent} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Etiquetas / Badges informativos en las esquinas */}
      <View style={styles.bottomBadgesOverlay}>
        <GlassView intensity={40} borderRadius={12} style={styles.badgeGlass}>
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
          <GlassView intensity={40} borderRadius={12} style={styles.badgeGlass}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
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
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#050505',
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
  audioToggleBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20,
  },
  bottomBadgesOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  badgeGlass: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
