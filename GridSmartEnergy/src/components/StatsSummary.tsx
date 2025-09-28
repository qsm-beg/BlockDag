import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface StatsSummaryProps {
  totalEarned: number;
  energySaved: number;
  tradesCompleted: number;
  currentStreak: number;
}

interface StatCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  index: number;
}

function StatCard({ icon, iconColor, label, value, index }: StatCardProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      index * 100,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(300)}
      style={[styles.statCard, animatedStyle]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function StatsSummary({
  totalEarned,
  energySaved,
  tradesCompleted,
  currentStreak,
}: StatsSummaryProps) {
  const stats = [
    {
      icon: 'cash',
      iconColor: colors.status.success,
      label: 'Total Earned',
      value: `R${totalEarned.toFixed(0)}`,
    },
    {
      icon: 'flash',
      iconColor: colors.status.warning,
      label: 'Energy Saved',
      value: `${energySaved.toFixed(0)} kWh`,
    },
    {
      icon: 'swap-horizontal',
      iconColor: colors.accent.cyan,
      label: 'Trades',
      value: tradesCompleted.toString(),
    },
    {
      icon: 'flame',
      iconColor: colors.status.danger,
      label: 'Day Streak',
      value: currentStreak.toString(),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Month</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            iconColor={stat.iconColor}
            label={stat.label}
            value={stat.value}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card.border,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});