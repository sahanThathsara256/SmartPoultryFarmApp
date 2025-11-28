import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from '@navigation/RootNavigator';
import {TelemetryProvider} from '@components/TelemetryProvider';
import {colors} from '@theme';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <TelemetryProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <RootNavigator />
        </TelemetryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
