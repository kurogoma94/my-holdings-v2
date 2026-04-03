// [目的] 下部タブバーのレイアウト定義（ルーレット / 店舗リスト の2タブ）
import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const insets = useSafeAreaInsets();
  
  // スマホ下部のナビゲーションバー等を考慮した余白調整
  const bottomPadding = Platform.OS === 'ios' ? Math.max(28, insets.bottom) : Math.max(12, insets.bottom + 8);
  const tabHeight = Platform.OS === 'ios' ? 60 + bottomPadding : 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface,
          borderTopColor: colorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface,
        },
        headerTintColor: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ルーレット',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>
              {focused ? '🎰' : '🎲'}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: '店舗リスト',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>
              {focused ? '📋' : '🍶'}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'サイトについて',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>
              {focused ? '💁‍♂️' : '💡'}
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});
