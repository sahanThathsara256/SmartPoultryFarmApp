import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingsStackParamList} from './types';
import SettingsScreen from '@screens/Settings/SettingsScreen';
import HistoryScreen from '@screens/History/HistoryScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{headerShown: false}} />
    <Stack.Screen
      name="History"
      component={HistoryScreen}
      options={{title: 'History & Logs', headerTintColor: '#fff', headerStyle: {backgroundColor: '#111B2C'}}}
    />
  </Stack.Navigator>
);

export default SettingsNavigator;
