import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { MainScreen } from './screens/MainScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <MainScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
