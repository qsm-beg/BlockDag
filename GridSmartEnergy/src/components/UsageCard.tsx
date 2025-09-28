import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

interface UsageCardProps {
  averageDailyUsage: number;
  currentUsage: number;
}

export default function UsageCard({ averageDailyUsage, currentUsage }: UsageCardProps) {
  return (
    <LinearGradient
      colors={[colors.card.background, colors.card.backgroundDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flash" size={24} color={colors.accent.cyan} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Your Daily Consumption</Text>

        <View style={styles.usageContainer}>
          <Text style={styles.label}>Average Daily:</Text>
          <Text style={styles.value}>{averageDailyUsage.toFixed(1)} kWh</Text>
        </View>

        <View style={styles.usageContainer}>
          <Text style={styles.label}>Current Usage:</Text>
          <Text style={[styles.value, { color: colors.accent.cyan }]}>
            {currentUsage.toFixed(1)} kWh
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.message}>
          Reduce usage today to earn incentives
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: colors.card.border,
    marginVertical: spacing.md,
  },
  message: {
    fontSize: 14,
    color: colors.accent.cyan,
    textAlign: 'center',
    fontWeight: '600',
  },
});