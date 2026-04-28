import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingsStackParamList} from './types';
import SettingsScreen from '@screens/Settings/SettingsScreen';
import HistoryScreen from '@screens/History/HistoryScreen';
import DebugScreen from '@screens/Settings/DebugScreen';
import {useThemeColors} from '@theme';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => {
  const colors = useThemeColors();

  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{headerShown: false}} />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History & Logs',
          headerTintColor: colors.textPrimary,
          headerStyle: {backgroundColor: colors.surfacePrimary},
        }}
      />
      <Stack.Screen
        name="Debug"
        component={DebugScreen}
        options={{
          title: 'Debug Panel',
          headerTintColor: colors.textPrimary,
          headerStyle: {backgroundColor: colors.surfacePrimary},
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
