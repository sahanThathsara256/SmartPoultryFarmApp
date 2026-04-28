import React, {ReactNode} from 'react';
import {ScrollView, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColors} from '@theme';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ScreenWrapper: React.FC<Props> = ({children, scrollable = true, contentContainerStyle}) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={[styles.safeArea, contentContainerStyle]}>{children}</SafeAreaView>;
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
  });
