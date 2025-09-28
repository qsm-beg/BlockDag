import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface EarningItem {
  id: string;
  timestamp: Date;
  amount: number;
  kwhReduced: number;
  type: 'reduction' | 'trade';
}

interface EarningsHistoryProps {
  earnings: EarningItem[];
  todayTotal: number;
  weeklyTotal: number;
}

export default function EarningsHistory({ earnings, todayTotal, weeklyTotal }: EarningsHistoryProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reduction':
        return 'flash';
      case 'trade':
        return 'swap-horizontal';
      default:
        return 'cash';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings History</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today</Text>
          <Text style={styles.summaryValue}>R{todayTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Week</Text>
          <Text style={styles.summaryValue}>R{weeklyTotal.toFixed(2)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {earnings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No earnings yet</Text>
            <Text style={styles.emptySubtext}>Reduce energy during peak events to earn</Text>
          </View>
        ) : (
          earnings.map((item) => (
            <View key={item.id} style={styles.earningItem}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon(item.type) as any}
                  size={20}
                  color={colors.accent.cyan}
                />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemType}>
                    {item.type === 'reduction' ? 'Energy Reduction' : 'P2P Trade'}
                  </Text>
                  <Text style={styles.itemAmount}>+R{item.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetailText}>{item.kwhReduced.toFixed(1)} kWh</Text>
                  <Text style={styles.itemTime}>{formatTime(item.timestamp)}</Text>
                </View>
              </View>
            </View>
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
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.accent.turquoise,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.card.border,
    marginHorizontal: spacing.sm,
  },
  listContainer: {
    maxHeight: 250,
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.card.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemType: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: '600',
  },
  itemAmount: {
    fontSize: fontSize.md,
    color: colors.accent.turquoise,
    fontWeight: 'bold',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetailText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  itemTime: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
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