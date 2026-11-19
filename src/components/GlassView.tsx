import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSettings } from '@/context/SettingsContext';

interface GlassViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  borderWidth?: number;
  tint?: 'dark' | 'light' | 'default';
  glowColor?: string;
}

export function GlassView({
  children,
  style,
  intensity = 35,
  borderRadius = 20,
  borderWidth = 1,
  tint = 'dark',
  glowColor,
}: GlassViewProps) {
  const { colors } = useSettings();

  const containerStyle: ViewStyle = {
    borderRadius,
    borderColor: glowColor || colors.border,
    borderWidth,
    backgroundColor: colors.glassBg,
    overflow: 'hidden',
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[containerStyle, style, { backdropFilter: 'blur(20px)' } as any]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
