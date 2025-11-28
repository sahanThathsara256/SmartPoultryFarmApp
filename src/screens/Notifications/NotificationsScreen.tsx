import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {useEventsStore} from '@store/useEventsStore';
import {colors, spacing} from '@theme';
import {formatTimestamp} from '@utils/formatters';
import {NotificationItem} from '@types';

const NotificationsScreen = () => {
  const notifications = useEventsStore(state => state.notifications);
  const clearNotifications = useEventsStore(state => state.clearNotifications);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={clearNotifications}>
          <Text style={styles.clear}>Clear all</Text>
        </Pressable>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={[styles.card, typeStyles[item.type]]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>All caught up 🎉</Text>}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  clear: {
    color: colors.accent,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  message: {
    color: colors.textSecondary,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

const typeStyles = StyleSheet.create({
  info: {
    backgroundColor: '#0f172a',
    borderColor: colors.info,
  },
  warning: {
    backgroundColor: '#1f1307',
    borderColor: colors.accentWarn,
  },
  critical: {
    backgroundColor: '#2a0f1a',
    borderColor: colors.accentError,
  },
}) satisfies Record<NotificationItem['type'], ViewStyle>;

export default NotificationsScreen;
