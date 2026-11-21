import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
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
import { GlassView } from './GlassView';
import {
  Trash2,
  CheckCircle2,
  RotateCcw,
  Share2,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Sparkles,
} from 'lucide-react-native';

export function CardStack() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { colors, settings, haptics } = useSettings();
  const {
    queue,
    currentIndex,
    markAsKept,
    moveToTrash,
    shareAsset,
    undo,
    canUndo,
  } = useMedia();

  const currentAsset = queue[currentIndex];
  const nextAsset = queue[currentIndex + 1];

  // Gestos compartidos
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isProcessing = useSharedValue(false);

  // Valores de configuración
  const keepDirection = settings.keepGestureDirection || 'left';
  const isKeepLeft = keepDirection === 'left';
  const threshold =
    settings.sensitivity === 'high' ? 85 : settings.sensitivity === 'low' ? 170 : 120;

  // Callback de JavaScript para actualizar estado y hápticos en el hilo JS
  const handleSwipeJS = useCallback(
    (action: 'keep' | 'trash') => {
      translateX.value = 0;
      translateY.value = 0;
      isProcessing.value = false;
      if (action === 'keep') {
        markAsKept();
      } else {
        moveToTrash();
      }
    },
    [markAsKept, moveToTrash, translateX, translateY, isProcessing]
  );

  // Disparar acción programáticamente
  const triggerSwipeProgrammatic = useCallback(
    (action: 'keep' | 'trash') => {
      if (isProcessing.value || !currentAsset) return;
      isProcessing.value = true;

      if (action === 'trash') {
        // Arriba siempre papelera
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 220 }, (finished) => {
          if (finished) runOnJS(handleSwipeJS)('trash');
        });
      } else {
        // Conservar según configuración (Izquierda o Abajo)
        if (isKeepLeft) {
          translateX.value = withTiming(-SCREEN_WIDTH * 1.25, { duration: 220 }, (finished) => {
            if (finished) runOnJS(handleSwipeJS)('keep');
          });
        } else {
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
            if (finished) runOnJS(handleSwipeJS)('keep');
          });
        }
      }
    },
    [currentAsset, isKeepLeft, SCREEN_HEIGHT, SCREEN_WIDTH, handleSwipeJS, isProcessing, translateX, translateY]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (isProcessing.value) return;

      if (isKeepLeft) {
        // Arriba (trash) y Izquierda (keep) son las direcciones activas
        // Permitimos movimiento libre pero amortiguando direcciones opuestas
        translateY.value = event.translationY;
        translateX.value = event.translationX;
      } else {
        // Vertical: Arriba (trash) y Abajo (keep)
        translateY.value = event.translationY;
        translateX.value = event.translationX * 0.15;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (isProcessing.value) return;

      // Deslizar ARRIBA: Papelera siempre
      if (event.translationY < -threshold || event.velocityY < -600) {
        isProcessing.value = true;
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 220 }, (finished) => {
          if (finished) runOnJS(handleSwipeJS)('trash');
        });
        return;
      }

      // Deslizar para CONSERVAR
      if (isKeepLeft) {
        // Izquierda es Conservar
        if (event.translationX < -threshold || event.velocityX < -600) {
          isProcessing.value = true;
          translateX.value = withTiming(-SCREEN_WIDTH * 1.25, { duration: 220 }, (finished) => {
            if (finished) runOnJS(handleSwipeJS)('keep');
          });
          return;
        }
      } else {
        // Abajo es Conservar
        if (event.translationY > threshold || event.velocityY > 600) {
          isProcessing.value = true;
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
            if (finished) runOnJS(handleSwipeJS)('keep');
          });
          return;
        }
      }

      // Si no superó el umbral, regresar con amortiguación limpia
      translateX.value = withSpring(0, { damping: 18, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 150 });
    });

  // Estilo animado de la tarjeta frontal activa (rotación sutil según arrastre)
  const topCardAnimatedStyle = useAnimatedStyle(() => {
    const rotDelta = isKeepLeft ? translateX.value : translateX.value + translateY.value * 0.2;
    const rotation = interpolate(
      rotDelta,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-8, 0, 8],
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

  // Tarjeta trasera ESTÁTICA y completamente aislada (nunca tiembla ni se mueve)
  const backCardStyle = {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 0.72,
  };

  // Etiqueta dinámica: DESCARTAR (Arriba)
  const trashLabelStyle = useAnimatedStyle(() => {
    const delta = -translateY.value;
    const opacity = interpolate(delta, [30, 100], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(delta, [30, 100], [0.85, 1.05], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Etiqueta dinámica: CONSERVAR (Izquierda o Abajo según configuración)
  const keepLabelStyle = useAnimatedStyle(() => {
    const delta = isKeepLeft ? -translateX.value : translateY.value;
    const opacity = interpolate(delta, [30, 100], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(delta, [30, 100], [0.85, 1.05], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (!currentAsset) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.tagBg }]}>
          <Sparkles size={38} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>¡Todo Organizado!</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Has revisado todos los archivos de esta selección. Cambia de período, álbum o revisa la papelera.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Pila de Tarjetas */}
      <View style={styles.deckArea}>
        {/* Tarjeta de fondo: solo visualización estática sin movimiento */}
        {nextAsset && (
          <View style={[styles.cardContainer, styles.backCard, backCardStyle]} pointerEvents="none">
            <MediaCard asset={nextAsset} isActive={false} />
          </View>
        )}

        {/* Tarjeta frontal activa con física interactiva */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.cardContainer, topCardAnimatedStyle]}>
            <MediaCard asset={currentAsset} isActive={true} />

            {/* Etiqueta dinámica: DESCARTAR (Arriba) */}
            <Animated.View
              style={[
                styles.floatingLabel,
                styles.trashLabel,
                { backgroundColor: colors.trashGlow, borderColor: colors.trash },
                trashLabelStyle,
              ]}
              pointerEvents="none"
            >
              <Trash2 size={20} color={colors.trash} />
              <Text style={[styles.labelText, { color: colors.trash }]}>DESCARTAR</Text>
            </Animated.View>

            {/* Etiqueta dinámica: CONSERVAR (Izquierda o Abajo) */}
            <Animated.View
              style={[
                styles.floatingLabel,
                isKeepLeft ? styles.keepLabelLeft : styles.keepLabelBottom,
                { backgroundColor: colors.keepGlow, borderColor: colors.keep },
                keepLabelStyle,
              ]}
              pointerEvents="none"
            >
              {isKeepLeft ? (
                <ArrowLeft size={20} color={colors.keep} />
              ) : (
                <CheckCircle2 size={20} color={colors.keep} />
              )}
              <Text style={[styles.labelText, { color: colors.keep }]}>CONSERVAR</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Barra de Atajos Rápidos (Deshacer, Papelera, Compartir, Siguiente) */}
      <View style={styles.actionsBarWrapper}>
        <GlassView
          intensity={40}
          borderRadius={24}
          style={[styles.actionsBarGlass, { borderColor: colors.border }]}
        >
          {/* Deshacer */}
          <TouchableOpacity
            onPress={undo}
            disabled={!canUndo}
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              {
                opacity: canUndo ? 1 : 0.4,
                backgroundColor: canUndo ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
              },
            ]}
          >
            <RotateCcw size={19} color={canUndo ? colors.amber : colors.textMuted} />
            <Text
              style={[
                styles.actionBtnLabel,
                { color: canUndo ? colors.amber : colors.textMuted },
              ]}
            >
              Deshacer
            </Text>
          </TouchableOpacity>

          {/* Papelera / Descartar */}
          <TouchableOpacity
            onPress={() => triggerSwipeProgrammatic('trash')}
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: colors.trashGlow }]}
          >
            <Trash2 size={20} color={colors.trash} />
            <Text style={[styles.actionBtnLabel, { color: colors.trash, fontWeight: '700' }]}>
              Papelera
            </Text>
          </TouchableOpacity>

          {/* Compartir */}
          <TouchableOpacity
            onPress={() => shareAsset()}
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: colors.surfaceSubtle }]}
          >
            <Share2 size={19} color={colors.textSecondary} />
            <Text style={[styles.actionBtnLabel, { color: colors.textSecondary }]}>
              Compartir
            </Text>
          </TouchableOpacity>

          {/* Siguiente / Conservar */}
          <TouchableOpacity
            onPress={() => triggerSwipeProgrammatic('keep')}
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: colors.keepGlow }]}
          >
            {isKeepLeft ? (
              <ArrowLeft size={20} color={colors.keep} strokeWidth={2.5} />
            ) : (
              <ArrowDown size={20} color={colors.keep} strokeWidth={2.5} />
            )}
            <Text style={[styles.actionBtnLabel, { color: colors.keep, fontWeight: '700' }]}>
              Conservar
            </Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  deckArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
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
    top: 24,
    alignSelf: 'center',
  },
  keepLabelBottom: {
    bottom: 24,
    alignSelf: 'center',
  },
  keepLabelLeft: {
    left: 20,
    top: '45%',
  },
  labelText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  actionsBarWrapper: {
    width: '100%',
    marginTop: 10,
    marginBottom: 4,
  },
  actionsBarGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 4,
    minWidth: 64,
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    maxWidth: 290,
  },
});
