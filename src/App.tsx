import React, { useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UI_COLORS } from './game/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen, MainScreen } from './screens';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'game' | 'results'>('menu');

  const renderScreens = () => {
    switch (screen) {
      case 'menu':
        return <MainScreen onStart={() => setScreen('game')} />;
      case 'game':
        return <GameScreen onMenu={() => setScreen('menu')} />;
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root}>{renderScreens()}</SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
});
