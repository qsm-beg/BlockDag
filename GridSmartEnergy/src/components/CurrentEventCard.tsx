import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface CurrentEventCardProps {
  isActive: boolean;
  incentiveRate: number;
  endTime: Date;
}

export default function CurrentEventCard({ isActive, incentiveRate, endTime }: CurrentEventCardProps) {
  const [countdown, setCountdown] = useState('00:00:00');
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isActive]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Event Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, [endTime]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isUrgent = countdown.includes(':') && parseInt(countdown.split(':')[1]) < 5;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isActive
            ? [colors.accent.turquoise, colors.accent.cyan]
            : [colors.card.background, colors.card.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {isActive && (
          <Animated.View style={[styles.pulseBackground, animatedStyle]} />
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons
                name="flash"
                size={24}
                color={isActive ? colors.text.primary : colors.text.secondary}
              />
              <Text style={[styles.title, !isActive && styles.inactiveTitle]}>
                {isActive ? 'Peak Event Active' : 'No Active Event'}
              </Text>
            </View>
            {isActive && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>LIVE</Text>
              </View>
            )}
          </View>

          {isActive && (
            <>
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>Time Remaining</Text>
                <Text style={[styles.countdown, isUrgent && styles.urgentCountdown]}>
                  {countdown}
                </Text>
              </View>

              <View style={styles.rateContainer}>
                <Text style={styles.rateLabel}>Current Incentive Rate</Text>
                <Text style={styles.rateValue}>R{incentiveRate.toFixed(2)}/kWh</Text>
              </View>
            </>
          )}

          {!isActive && (
            <Text style={styles.inactiveText}>
              Check back during peak hours for earning opportunities
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  pulseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  inactiveTitle: {
    color: colors.text.secondary,
  },
  badge: {
    backgroundColor: colors.status.danger,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.text.primary,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  countdownLabel: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  countdown: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  urgentCountdown: {
    color: colors.status.danger,
  },
  rateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  rateValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  inactiveText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});