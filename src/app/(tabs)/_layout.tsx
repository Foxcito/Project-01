import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import { useMedia } from '@/context/MediaContext';
import { Layers, Folder, Trash2, Sliders } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors } = useSettings();
  const { trashCount } = useMedia();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 68,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
          position: 'absolute',
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Revisión',
          tabBarIcon: ({ color, focused }) => (
            <Layers size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Álbumes',
          tabBarIcon: ({ color, focused }) => (
            <Folder size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Papelera',
          tabBarBadge: trashCount > 0 ? (trashCount > 99 ? '99+' : trashCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.trash,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
          tabBarIcon: ({ color, focused }) => (
            <Trash2 size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <Sliders size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
