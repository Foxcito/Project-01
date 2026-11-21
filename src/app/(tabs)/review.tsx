import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { TopHeader } from '@/components/TopHeader';
import { CardStack } from '@/components/CardStack';
import { AlbumQuickBar } from '@/components/AlbumQuickBar';
import { BatchSummaryModal } from '@/components/BatchSummaryModal';

export default function ReviewScreen() {
  const { colors } = useSettings();
  const { queue, pendingCount } = useMedia();
  const [batchModalVisible, setBatchModalVisible] = useState(false);

  // Apertura automática de resumen por lote al terminar los archivos de la selección
  useEffect(() => {
    if (queue.length === 0 && pendingCount > 0) {
      setBatchModalVisible(true);
    }
  }, [queue.length, pendingCount]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Barra superior minimalista con selector interactivo y botón volver */}
        <TopHeader
          onOpenBatchSummary={() => setBatchModalVisible(true)}
          showBackButton={true}
        />

        {/* Pila de tarjetas central con zoom independiente y gestos aislados */}
        <View style={styles.stackWrapper}>
          <CardStack />
        </View>

        {/* Barra inferior de acceso rápido a carpetas/álbumes */}
        <View style={styles.quickBarWrapper}>
          <AlbumQuickBar />
        </View>

        {/* Modal Resumen de Lote ¡Listo! */}
        <BatchSummaryModal
          visible={batchModalVisible}
          onClose={() => setBatchModalVisible(false)}
        />
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
