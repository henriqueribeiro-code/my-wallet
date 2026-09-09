import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts,
} from '@expo-google-fonts/sora';

import { WalletProvider } from './src/context/WalletContext';
import { Navigation } from './src/navigation';
import { getDatabase } from './src/database/db';
import { colors } from './src/theme';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    // Abre a conexão e roda as migrations antes de qualquer tela montar.
    getDatabase()
      .catch((error) => console.error('Falha ao preparar o banco local', error))
      .finally(() => setDatabaseReady(true));
  }, []);

  const onLayout = useCallback(() => {
    if ((fontsLoaded || fontError) && databaseReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, databaseReady]);

  if ((!fontsLoaded && !fontError) || !databaseReady) return null;

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayout}>
        <StatusBar style="light" />
        <WalletProvider>
          <Navigation />
        </WalletProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
