import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface PendingRewardsCardProps {
  pendingAmount: number;
  lastClaimDate?: Date;
  onClaim: () => void;
  isClaimable: boolean;
}

export default function PendingRewardsCard({
  pendingAmount,
  lastClaimDate,
  onClaim,
  isClaimable,
}: PendingRewardsCardProps) {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const coinRotation = useSharedValue(0);

  useEffect(() => {
    if (pendingAmount > 0) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );

      coinRotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
    }
  }, [pendingAmount]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 400,
    });
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.3, 0]),
  }));

  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${coinRotation.value}deg` }],
  }));

  const formatLastClaim = (date?: Date) => {
    if (!date) return 'Never claimed';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Claimed today';
    if (days === 1) return 'Claimed yesterday';
    return `Claimed ${days} days ago`;
  };

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <LinearGradient
        colors={[colors.accent.turquoise, colors.accent.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Animated.View style={coinStyle}>
                <Ionicons name="cash" size={28} color={colors.text.primary} />
              </Animated.View>
              <Text style={styles.title}>Pending Rewards</Text>
            </View>
            {pendingAmount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Ready</Text>
              </View>
            )}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>R</Text>
            <Text style={styles.amount}>{pendingAmount.toFixed(2)}</Text>
          </View>

          <Text style={styles.lastClaim}>{formatLastClaim(lastClaimDate)}</Text>

          <TouchableOpacity
            style={[
              styles.claimButton,
              !isClaimable && styles.claimButtonDisabled,
            ]}
            onPress={onClaim}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!isClaimable}
          >
            <LinearGradient
              colors={
                isClaimable
                  ? [colors.text.primary, colors.text.primary]
                  : [colors.card.background, colors.card.background]
              }
              style={styles.buttonGradient}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={isClaimable ? colors.accent.cyan : colors.text.secondary}
              />
              <Text
                style={[
                  styles.claimButtonText,
                  !isClaimable && styles.claimButtonTextDisabled,
                ]}
              >
                {isClaimable ? 'Claim Rewards' : 'No Rewards Available'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  currencySymbol: {
    fontSize: fontSize.xl,
    color: colors.text.primary,
    marginRight: spacing.xs,
    opacity: 0.8,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  lastClaim: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  claimButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  claimButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  claimButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.accent.cyan,
    marginLeft: spacing.xs,
  },
  claimButtonTextDisabled: {
    color: colors.text.secondary,
  },
});