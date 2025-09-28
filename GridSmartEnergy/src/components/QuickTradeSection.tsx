import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface QuickTradeSectionProps {
  hasExcess: boolean;
  amount: number;
  pricePerKwh: number;
  priceChange: number;
  onTrade: () => void;
}

export default function QuickTradeSection({
  hasExcess,
  amount,
  pricePerKwh,
  priceChange,
  onTrade,
}: QuickTradeSectionProps) {
  const scale = useSharedValue(1);
  const priceAnimation = useSharedValue(0);

  useEffect(() => {
    priceAnimation.value = withSpring(priceChange, {
      damping: 15,
      stiffness: 150,
    });
  }, [priceChange]);

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

  const priceChangeStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      priceAnimation.value,
      [-1, 0, 1],
      [-45, 0, 45]
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const isPriceUp = priceChange > 0;
  const actionText = hasExcess ? 'Sell Energy' : 'Buy Energy';
  const actionColor = hasExcess ? colors.status.success : colors.status.warning;

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <View style={styles.header}>
        <Text style={styles.title}>{actionText}</Text>
        <View style={[styles.badge, { backgroundColor: actionColor }]}>
          <Text style={styles.badgeText}>Quick Trade</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <View style={styles.priceValueRow}>
            <Text style={styles.priceValue}>R{pricePerKwh.toFixed(2)}</Text>
            <Text style={styles.priceUnit}>/kWh</Text>
            <Animated.View style={[styles.priceIndicator, priceChangeStyle]}>
              <Ionicons
                name={isPriceUp ? 'trending-up' : 'trending-down'}
                size={20}
                color={isPriceUp ? colors.status.success : colors.status.danger}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Available Amount</Text>
          <Text style={styles.amountValue}>{amount.toFixed(2)} kWh</Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Value</Text>
          <Text style={styles.totalValue}>
            R{(amount * pricePerKwh).toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: actionColor }]}
        onPress={onTrade}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Ionicons
          name={hasExcess ? 'push-outline' : 'download-outline'}
          size={24}
          color={colors.text.primary}
        />
        <Text style={styles.actionButtonText}>{actionText} Now</Text>
      </TouchableOpacity>
    </Animated.View>
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
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  priceContainer: {
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  priceRow: {
    marginBottom: spacing.sm,
  },
  priceLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.accent.cyan,
  },
  priceUnit: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  priceIndicator: {
    marginLeft: spacing.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  amountLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  amountValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.card.border,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.accent.turquoise,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
});