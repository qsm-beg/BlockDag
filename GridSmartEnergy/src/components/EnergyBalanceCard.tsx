import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface EnergyBalanceCardProps {
  netUsage: number;
  solarGeneration: number;
  dailyAverage?: number;
}

export default function EnergyBalanceCard({ netUsage, solarGeneration, dailyAverage = 4.5 }: EnergyBalanceCardProps) {
  const hasExcess = solarGeneration > netUsage;
  const balance = hasExcess ? solarGeneration - netUsage : netUsage - solarGeneration;
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.8, 1]),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedBackground, animatedBackgroundStyle]}>
        <LinearGradient
          colors={
            hasExcess
              ? [colors.status.success, colors.accent.turquoise]
              : [colors.status.warning, colors.status.danger]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="analytics"
            size={28}
            color={colors.text.primary}
          />
          <Text style={styles.statusText}>Energy Status</Text>
        </View>

        <View style={styles.dailyAverageContainer}>
          <Text style={styles.dailyAverageLabel}>Your daily average consumption is</Text>
          <View style={styles.dailyAverageValueContainer}>
            <Text style={styles.dailyAverageValue}>{dailyAverage.toFixed(1)}</Text>
            <Text style={styles.dailyAverageUnit}>kWh</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusContainer}>
          <Ionicons
            name={hasExcess ? 'sunny' : 'flash'}
            size={24}
            color={hasExcess ? colors.accent.turquoise : colors.status.warning}
          />
          <Text style={[styles.statusLabel, hasExcess ? styles.surplusText : styles.deficitText]}>
            {hasExcess ? 'SURPLUS' : 'DEFICIT'}
          </Text>
        </View>

        <Text style={styles.description}>
          {hasExcess
            ? `You currently have ${balance.toFixed(2)} kWh excess solar energy to trade`
            : `You have gone above your daily average consumption. You may need to purchase energy`}
        </Text>

        {solarGeneration > 0 && (
          <View style={styles.solarInfo}>
            <Ionicons name="sunny-outline" size={16} color={colors.accent.turquoise} />
            <Text style={styles.solarText}>
              Generating {solarGeneration.toFixed(2)} kWh from solar
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  dailyAverageContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dailyAverageLabel: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    opacity: 0.9,
  },
  dailyAverageValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  dailyAverageValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  dailyAverageUnit: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  surplusText: {
    color: colors.accent.turquoise,
  },
  deficitText: {
    color: colors.status.warning,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    textAlign: 'center',
    opacity: 0.9,
  },
  solarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  solarText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
});