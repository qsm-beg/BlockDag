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
}

export default function EnergyBalanceCard({ netUsage, solarGeneration }: EnergyBalanceCardProps) {
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
            name={hasExcess ? 'sunny' : 'flash'}
            size={32}
            color={colors.text.primary}
          />
          <Text style={styles.statusText}>
            {hasExcess ? 'Energy Surplus' : 'Energy Deficit'}
          </Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text>
          <Text style={styles.balanceUnit}>kWh</Text>
        </View>

        <Text style={styles.description}>
          {hasExcess
            ? 'You have excess solar energy to trade'
            : 'You may need to purchase energy'}
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
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  balanceUnit: {
    fontSize: fontSize.xl,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    opacity: 0.8,
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