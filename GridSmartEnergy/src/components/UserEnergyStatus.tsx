import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface UserEnergyStatusProps {
  currentUsage: number;
  solarGeneration: number;
  netUsage: number;
}

function AnimatedValue({ value, unit }: { value: number; unit: string }) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value]);

  const [displayValue, setDisplayValue] = React.useState('0.00');

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(animatedValue.value.toFixed(2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={styles.valueText}>
      {displayValue} {unit}
    </Text>
  );
}

export default function UserEnergyStatus({
  currentUsage,
  solarGeneration,
  netUsage
}: UserEnergyStatusProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Energy Status</Text>

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={24} color={colors.status.warning} />
          </View>
          <Text style={styles.label}>Current Usage</Text>
          <AnimatedValue value={currentUsage} unit="kWh" />
        </View>

        <View style={styles.divider} />

        <View style={styles.statusItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="sunny" size={24} color={colors.accent.turquoise} />
          </View>
          <Text style={styles.label}>Solar Generation</Text>
          <AnimatedValue value={solarGeneration} unit="kWh" />
        </View>
      </View>

      <View style={styles.netUsageContainer}>
        <View style={styles.netUsageHeader}>
          <Ionicons name="trending-up" size={20} color={colors.accent.cyan} />
          <Text style={styles.netLabel}>Net Usage</Text>
        </View>
        <Text style={styles.netValue}>{netUsage.toFixed(2)} kWh</Text>
      </View>
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
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  valueText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.card.border,
    marginHorizontal: spacing.sm,
  },
  netUsageContainer: {
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netUsageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  netValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.accent.cyan,
  },
});