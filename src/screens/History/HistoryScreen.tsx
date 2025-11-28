import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {useEventsStore} from '@store/useEventsStore';
import {colors, spacing} from '@theme';
import {formatTimestamp} from '@utils/formatters';

const HistoryScreen = () => {
  const history = useEventsStore(state => state.history);

  return (
    <ScreenWrapper scrollable={false}>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No events recorded yet.</Text>}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desc: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  timestamp: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;
