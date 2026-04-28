import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from '@navigation/RootNavigator';
import {TelemetryProvider} from '@components/TelemetryProvider';
import {useThemeColors, useThemeStore} from '@theme';

const App = () => {
  const colors = useThemeColors();
  const hydrateThemeMode = useThemeStore(state => state.hydrateThemeMode);

  React.useEffect(() => {
    hydrateThemeMode();
  }, [hydrateThemeMode]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <TelemetryProvider>
          <StatusBar barStyle={colors.background === '#0B1221' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
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
