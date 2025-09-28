import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';
import { PredictionRecord } from '../services/predictionService';

interface PredictionHistoryProps {
  history: PredictionRecord[];
}

export default function PredictionHistory({ history }: PredictionHistoryProps) {
  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'prevented':
        return colors.accent.green;
      case 'occurred':
        return colors.alert.error;
      case 'partial':
        return colors.accent.yellow;
      default:
        return colors.text.secondary;
    }
  };

  const getOutcomeIcon = (outcome?: string): keyof typeof Ionicons.glyphMap => {
    switch (outcome) {
      case 'prevented':
        return 'checkmark-circle';
      case 'occurred':
        return 'close-circle';
      case 'partial':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderHistoryItem = ({ item }: { item: PredictionRecord }) => (
    <View style={styles.historyItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{formatDate(item.timeRange.start)}</Text>
        <Text style={styles.time}>
          {formatTime(item.timeRange.start)} - {formatTime(item.timeRange.end)}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.locationText}>
            {item.area}, {item.city}
          </Text>
        </View>

        <View style={styles.outcomeRow}>
          <View style={[styles.outcomeBadge, { backgroundColor: getOutcomeColor(item.outcome) }]}>
            <Ionicons name={getOutcomeIcon(item.outcome)} size={16} color={colors.white} />
            <Text style={styles.outcomeText}>
              {item.outcome === 'prevented' ? 'Overload Prevented' :
               item.outcome === 'occurred' ? 'Overload Occurred' :
               item.outcome === 'partial' ? 'Partially Prevented' : 'Pending'}
            </Text>
          </View>
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyText}>{item.accuracyScore}% accurate</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={14} color={colors.text.secondary} />
            <Text style={styles.statText}>{item.totalParticipants} participants</Text>
          </View>
          {item.energySaved > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="leaf" size={14} color={colors.accent.green} />
              <Text style={styles.statText}>{item.energySaved.toFixed(1)} kWh saved</Text>
            </View>
          )}
          {item.rewardsDistributed > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="cash" size={14} color={colors.accent.yellow} />
              <Text style={styles.statText}>R{item.rewardsDistributed.toFixed(2)}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (history.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="time" size={48} color={colors.text.secondary} />
        <Text style={styles.emptyStateTitle}>No History Yet</Text>
        <Text style={styles.emptyStateText}>
          Prediction records will appear here after events complete
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      renderItem={renderHistoryItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: spacing.lg,
  },
  historyItem: {
    backgroundColor: colors.card.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.card.border,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  time: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  detailsContainer: {
    marginTop: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  outcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  accuracyBadge: {
    backgroundColor: colors.primary.backgroundDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  statText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});