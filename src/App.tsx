import React, {useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import GameScreen from './screens/GameScreen';

export default function App() {
  const [started, setStarted] = useState(false);
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050612" />
      <SafeAreaView style={styles.root}>
        <GameScreen started={started} onStart={() => setStarted(true)} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({root:{flex:1,backgroundColor:'#050612'}});
