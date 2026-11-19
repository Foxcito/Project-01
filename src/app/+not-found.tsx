import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';

export default function NotFoundScreen() {
  const { colors } = useSettings();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Esta pantalla no existe.</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={[styles.link, { backgroundColor: colors.primary }]}>
            <Text style={styles.linkText}>Ir a la pantalla principal</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  link: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  linkText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
