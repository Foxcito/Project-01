import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';
import { TopHeader } from '@/components/TopHeader';
import { CardStack } from '@/components/CardStack';
import { AlbumQuickBar } from '@/components/AlbumQuickBar';

export default function ReviewScreen() {
  const { colors } = useSettings();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Barra superior minimalista */}
        <TopHeader />

        {/* Pila de tarjetas central con física Reanimated */}
        <View style={styles.stackWrapper}>
          <CardStack />
        </View>

        {/* Barra inferior de acceso rápido a carpetas/álbumes */}
        <View style={styles.quickBarWrapper}>
          <AlbumQuickBar />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stackWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBarWrapper: {
    marginBottom: 72, // Espacio para la barra de navegación de pestañas inferior
  },
});
