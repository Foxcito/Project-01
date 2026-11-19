import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { useMedia } from '@/context/MediaContext';
import { useSettings } from '@/context/SettingsContext';
import { MediaCard } from './MediaCard';
import { Trash2, CheckCircle2, Sparkles } from 'lucide-react-native';

export function CardStack() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { colors, settings, haptics } = useSettings();
  const { queue, currentIndex, markAsKept, moveToTrash, totalInQueue } = useMedia();

  const currentAsset = queue[currentIndex];
  const nextAsset = queue[currentIndex + 1];

  // Gestos compartidos
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Calcular umbral según sensibilidad
  const getThreshold = useCallback(() => {
    switch (settings.sensitivity) {
      case 'high':
        return 85;
      case 'low':
        return 180;
      case 'medium':
      default:
        return 125;
    }
  }, [settings.sensitivity]);

  const onSwipeComplete = useCallback(
    (action: 'keep' | 'trash') => {
      'worklet';
      if (action === 'keep') {
        runOnJS(markAsKept)();
      } else {
        runOnJS(moveToTrash)();
      }
      translateX.value = 0;
      translateY.value = 0;
    },
    [markAsKept, moveToTrash, translateX, translateY]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (settings.gestureDirection === 'vertical') {
        translateY.value = event.translationY;
        translateX.value = event.translationX * 0.15; // ligera rotación orgánica
      } else {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.15;
      }
    })
    .onEnd((event) => {
      const threshold = getThreshold();

      if (settings.gestureDirection === 'vertical') {
        // Hacia arriba = Basura, Hacia abajo = Conservar
        if (event.translationY < -threshold || event.velocityY < -600) {
          translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 }, () => {
            onSwipeComplete('trash');
          });
        } else if (event.translationY > threshold || event.velocityY > 600) {
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
            onSwipeComplete('keep');
          });
        } else {
          translateY.value = withSpring(0, { damping: 15 });
          translateX.value = withSpring(0);
        }
      } else {
        // Hacia la izquierda = Basura, Hacia la derecha = Conservar
        if (event.translationX < -threshold || event.velocityX < -600) {
          translateX.value = withTiming(-SCREEN_WIDTH * 1.2, { duration: 250 }, () => {
            onSwipeComplete('trash');
          });
        } else if (event.translationX > threshold || event.velocityX > 600) {
          translateX.value = withTiming(SCREEN_WIDTH * 1.2, { duration: 250 }, () => {
            onSwipeComplete('keep');
          });
        } else {
          translateX.value = withSpring(0, { damping: 15 });
          translateY.value = withSpring(0);
        }
      }
    });

  // Estilo animado de la tarjeta frontal
  const topCardAnimatedStyle = useAnimatedStyle(() => {
    const isVertical = settings.gestureDirection === 'vertical';
    const mainDelta = isVertical ? translateY.value : translateX.value;
    const rotation = interpolate(
      mainDelta,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // Estilo animado de la tarjeta posterior en la pila
  const backCardAnimatedStyle = useAnimatedStyle(() => {
    const isVertical = settings.gestureDirection === 'vertical';
    const mainDelta = Math.abs(isVertical ? translateY.value : translateX.value);
    const scale = interpolate(mainDelta, [0, 150], [0.93, 1], Extrapolation.CLAMP);
    const opacity = interpolate(mainDelta, [0, 150], [0.65, 1], Extrapolation.CLAMP);
    const translateYOffset = interpolate(mainDelta, [0, 150], [14, 0], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateY: translateYOffset }],
      opacity,
    };
  });

  // Etiqueta dinámica de Basura (Rojo Coral)
  const trashLabelStyle = useAnimatedStyle(() => {
    const isVertical = settings.gestureDirection === 'vertical';
    const delta = isVertical ? -translateY.value : -translateX.value;
    const opacity = interpolate(delta, [20, 90], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(delta, [20, 90], [0.8, 1.1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Etiqueta dinámica de Conservar (Verde Esmeralda)
  const keepLabelStyle = useAnimatedStyle(() => {
    const isVertical = settings.gestureDirection === 'vertical';
    const delta = isVertical ? translateY.value : translateX.value;
    const opacity = interpolate(delta, [20, 90], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(delta, [20, 90], [0.8, 1.1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (!currentAsset) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(48, 209, 88, 0.12)' }]}>
          <Sparkles size={40} color={colors.keep} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>¡Todo Organizado!</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Has revisado todos los elementos de este filtro. Cambia de filtro o revisa la papelera.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tarjeta de fondo (Siguiente en la pila) */}
      {nextAsset && (
        <Animated.View
          style={[styles.cardContainer, styles.backCard, backCardAnimatedStyle]}
          pointerEvents="none"
        >
          <MediaCard asset={nextAsset} isActive={false} />
        </Animated.View>
      )}

      {/* Tarjeta Principal Activa */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardContainer, topCardAnimatedStyle]}>
          <MediaCard asset={currentAsset} isActive={true} />

          {/* Etiqueta dinámica: DESCARTAR */}
          <Animated.View
            style={[
              styles.floatingLabel,
              styles.trashLabel,
              { backgroundColor: colors.trashGlow, borderColor: colors.trash },
              trashLabelStyle,
            ]}
            pointerEvents="none"
          >
            <Trash2 size={24} color={colors.trash} />
            <Text style={[styles.labelText, { color: colors.trash }]}>DESCARTAR</Text>
          </Animated.View>

          {/* Etiqueta dinámica: CONSERVAR */}
          <Animated.View
            style={[
              styles.floatingLabel,
              styles.keepLabel,
              { backgroundColor: colors.keepGlow, borderColor: colors.keep },
              keepLabelStyle,
            ]}
            pointerEvents="none"
          >
            <CheckCircle2 size={24} color={colors.keep} />
            <Text style={[styles.labelText, { color: colors.keep }]}>CONSERVAR</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  backCard: {
    zIndex: 1,
  },
  floatingLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    zIndex: 30,
  },
  trashLabel: {
    top: 28,
    alignSelf: 'center',
  },
  keepLabel: {
    bottom: 28,
    alignSelf: 'center',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
