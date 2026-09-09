import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';

import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { colors, font } from '../theme';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.line,
    text: colors.text,
    primary: colors.income,
  },
};

const ICONS: Record<keyof RootTabParamList, string> = {
  Hoje: '◐',
  Extrato: '☰',
  Novo: '＋',
  Ajustes: '⚙',
};

export function Navigation() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.income,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.line,
            height: 62,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: font.bodyMedium,
            fontSize: 11,
          },
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>{ICONS[route.name]}</Text>
          ),
        })}
      >
        <Tab.Screen name="Hoje" component={HomeScreen} />
        <Tab.Screen name="Extrato" component={TransactionsScreen} />
        <Tab.Screen name="Novo" component={AddTransactionScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
