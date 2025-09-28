import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../styles/theme';

interface AccuracyMetricsProps {
  accuracy: {
    weekly: number;
    monthly: number;
    overloadsPrevented: number;
  };
}

export default function AccuracyMetrics({ accuracy }: AccuracyMetricsProps) {
  const getAccuracyColor = (value: number) => {
    if (value >= 90) return colors.accent.green;
    if (value >= 75) return colors.accent.cyan;
    if (value >= 60) return colors.accent.yellow;
    return colors.alert.error;
  };

  return (
    <LinearGradient
      colors={[colors.card.background, colors.card.backgroundDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.titleRow}>
        <Ionicons name="analytics" size={20} color={colors.accent.cyan} />
        <Text style={styles.title}>AI Performance</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="calendar" size={16} color={colors.text.secondary} />
            <Text style={styles.metricLabel}>Weekly</Text>
          </View>
          <Text style={[styles.metricValue, { color: getAccuracyColor(accuracy.weekly) }]}>
            {accuracy.weekly}%
          </Text>
          <Text style={styles.metricSubtext}>Accuracy</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="trending-up" size={16} color={colors.text.secondary} />
            <Text style={styles.metricLabel}>Monthly</Text>
          </View>
          <Text style={[styles.metricValue, { color: getAccuracyColor(accuracy.monthly) }]}>
            {accuracy.monthly}%
          </Text>
          <Text style={styles.metricSubtext}>Accuracy</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="shield-checkmark" size={16} color={colors.accent.green} />
            <Text style={styles.metricLabel}>Protected</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.accent.green }]}>
            {accuracy.overloadsPrevented}
          </Text>
          <Text style={styles.metricSubtext}>Overloads</Text>
        </View>
      </View>

      <View style={styles.learningIndicator}>
        <View style={styles.learningDot} />
        <Text style={styles.learningText}>AI Model Learning & Improving</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  learningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.card.border,
  },
  learningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.green,
    marginRight: spacing.sm,
  },
  learningText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});