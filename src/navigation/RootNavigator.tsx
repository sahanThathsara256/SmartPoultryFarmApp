import React, {useEffect} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import AuthNavigator from './AuthNavigator';
import MainTabs from './MainTabs';
import SplashScreen from '@screens/Auth/SplashScreen';
import {useAuthStore} from '@store/useAuthStore';
import {useThemeColors} from '@theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const user = useAuthStore(state => state.user);
  const hydrate = useAuthStore(state => state.hydrate);
  const initializing = useAuthStore(state => state.initializing);
  const colors = useThemeColors();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surfacePrimary,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Splash">
        {initializing && <Stack.Screen name="Splash" component={SplashScreen} />}
        {!initializing && !user && <Stack.Screen name="Auth" component={AuthNavigator} />}
        {!initializing && user && <Stack.Screen name="App" component={MainTabs} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
