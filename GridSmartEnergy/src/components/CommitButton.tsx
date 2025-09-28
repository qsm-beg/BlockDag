import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface CommitButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading?: boolean;
}

export default function CommitButton({ onPress, disabled, isLoading }: CommitButtonProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!disabled && !isLoading) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glow.value = withTiming(0, { duration: 300 });
    }
  }, [disabled, isLoading]);

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
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.8]),
    shadowRadius: interpolate(glow.value, [0, 1], [0, 20]),
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={[styles.container, animatedStyle]}
      activeOpacity={0.9}
    >
      <AnimatedLinearGradient
        colors={
          disabled
            ? [colors.card.background, colors.card.background]
            : [colors.accent.turquoise, colors.accent.cyan]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          !disabled && styles.activeShadow,
          glowStyle,
        ]}
      >
        {isLoading ? (
          <Animated.View style={styles.loadingContainer}>
            <Text style={styles.buttonText}>Committing...</Text>
          </Animated.View>
        ) : (
          <Text style={[styles.buttonText, disabled && styles.disabledText]}>
            {disabled ? 'Select Reduction Amount' : 'Commit to Reduction'}
          </Text>
        )}
      </AnimatedLinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.md,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeShadow: {
    shadowColor: colors.accent.cyan,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  disabledText: {
    color: colors.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});