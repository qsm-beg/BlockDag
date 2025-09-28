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
  withSequence,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface WalletConnectionSectionProps {
  isConnected: boolean;
  address?: string;
  balance?: number;
  onConnect: () => void;
  onCopyAddress: () => void;
}

export default function WalletConnectionSection({
  isConnected,
  address,
  balance = 0,
  onConnect,
  onCopyAddress,
}: WalletConnectionSectionProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!isConnected) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isConnected]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.8,
    shadowRadius: glow.value * 20,
  }));

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={[colors.accent.turquoise, colors.accent.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.connectGradient, glowStyle]}
        >
          <TouchableOpacity
            onPress={onConnect}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.connectButton}
          >
            <Ionicons name="wallet" size={32} color={colors.text.primary} />
            <Text style={styles.connectTitle}>Connect Wallet</Text>
            <Text style={styles.connectSubtext}>
              Link your BlockDAG wallet to start earning
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.connectedCard}>
        <View style={styles.walletHeader}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Connected</Text>
          </View>
          <Ionicons name="wallet" size={24} color={colors.accent.cyan} />
        </View>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Wallet Address</Text>
          <TouchableOpacity style={styles.addressRow} onPress={onCopyAddress}>
            <Text style={styles.address}>{formatAddress(address || '')}</Text>
            <Ionicons name="copy-outline" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>BDAG Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toFixed(4)}</Text>
            <Text style={styles.balanceUnit}>BDAG</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  connectGradient: {
    borderRadius: borderRadius.lg,
    shadowColor: colors.accent.cyan,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  connectButton: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  connectTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  connectSubtext: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    opacity: 0.9,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  connectedCard: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  addressContainer: {
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  addressLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  balanceContainer: {
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.accent.cyan,
  },
  balanceUnit: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});