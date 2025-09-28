import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface AlertBannerProps {
  isVisible: boolean;
  incentiveRate: number;
  onReduceNow: () => void;
}

export default function AlertBanner({ isVisible, incentiveRate, onReduceNow }: AlertBannerProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[colors.status.danger, colors.status.warning]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <View style={styles.iconRow}>
              <Ionicons name="flash" size={20} color={colors.text.primary} />
              <Text style={styles.alertText}>Peak Alert - Earn R{incentiveRate.toFixed(2)}/kWh</Text>
            </View>
            <Text style={styles.subText}>Reduce usage now to earn rewards!</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onReduceNow}>
            <Text style={styles.buttonText}>Reduce Now</Text>
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
  },
  gradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  subText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    marginTop: 4,
    opacity: 0.9,
  },
  button: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  buttonText: {
    color: colors.status.danger,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
});