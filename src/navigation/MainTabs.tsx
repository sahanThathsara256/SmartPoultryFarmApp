import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {BottomTabNavigationOptions, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Feather} from '@expo/vector-icons';
import {AppTabsParamList} from './types';
import DashboardScreen from '@screens/Dashboard/DashboardScreen';
import ControlScreen from '@screens/Controls/ControlScreen';
import AutomationScreen from '@screens/Automation/AutomationScreen';
import NotificationsScreen from '@screens/Notifications/NotificationsScreen';
import SettingsNavigator from './SettingsNavigator';
import {useThemeColors} from '@theme';

const Tab = createBottomTabNavigator<AppTabsParamList>();

type FeatherName = React.ComponentProps<typeof Feather>['name'];

const iconMap: Record<keyof AppTabsParamList, FeatherName> = {
  Dashboard: 'activity',
  Controls: 'toggle-left',
  Automation: 'sliders',
  Notifications: 'bell',
  Settings: 'settings',
};

type TabRoute = RouteProp<AppTabsParamList, keyof AppTabsParamList>;

const renderTabIcon = (routeName: keyof AppTabsParamList) =>
  ({color, size}: {color: string; size: number}) => (
    <Feather name={iconMap[routeName]} color={color} size={size} />
  );

const tabScreenOptions = ({route}: {route: TabRoute}): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarLabelStyle: {fontSize: 12},
  tabBarIcon: renderTabIcon(route.name),
});

const MainTabs = () => {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        ...tabScreenOptions({route}),
        tabBarStyle: {backgroundColor: colors.surfacePrimary, borderTopColor: colors.border},
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Controls" component={ControlScreen} />
      <Tab.Screen name="Automation" component={AutomationScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabs;
