import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

export interface Activity {
  id: string;
  type: 'reduction' | 'trade' | 'claim' | 'solar';
  description: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending';
}

interface ActivityFeedProps {
  activities: Activity[];
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'reduction':
        return { name: 'flash', color: colors.status.warning };
      case 'trade':
        return { name: 'swap-horizontal', color: colors.accent.cyan };
      case 'claim':
        return { name: 'cash', color: colors.status.success };
      case 'solar':
        return { name: 'sunny', color: colors.accent.turquoise };
      default:
        return { name: 'ellipse', color: colors.text.secondary };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const icon = getIcon();

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(300)}
      layout={Layout.springify()}
      style={styles.activityItem}
    >
      <View style={styles.timeline}>
        <View style={[styles.iconCircle, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        {index < 10 && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text
            style={[
              styles.activityAmount,
              activity.amount > 0 && styles.positiveAmount,
            ]}
          >
            {activity.amount > 0 ? '+' : ''}R{Math.abs(activity.amount).toFixed(2)}
          </Text>
        </View>
        <View style={styles.activityFooter}>
          <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
          {activity.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activities.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
      >
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptySubtext}>
              Your energy transactions will appear here
            </Text>
          </View>
        ) : (
          activities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card.border,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.accent.cyan,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  feedContainer: {
    maxHeight: 300,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.card.border,
    marginTop: spacing.xs,
  },
  activityContent: {
    flex: 1,
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  activityDescription: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  activityAmount: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  positiveAmount: {
    color: colors.status.success,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  pendingBadge: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pendingText: {
    fontSize: fontSize.xs,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});