import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

interface ReductionSliderProps {
  incentiveRate: number;
  onValueChange: (value: number) => void;
  value: number;
}

export default function ReductionSlider({ incentiveRate, onValueChange, value }: ReductionSliderProps) {
  const animatedValue = useSharedValue(0);
  const potentialEarnings = value * incentiveRate;

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 15,
      stiffness: 150,
    });
  }, [value]);

  const numberStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, 5],
      [1, 1.2]
    );
    return {
      transform: [{ scale }],
    };
  });

  const earningsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedValue.value,
      [0, 0.5],
      [0.5, 1]
    );
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reduction Commitment</Text>

      <View style={styles.valueContainer}>
        <Animated.View style={numberStyle}>
          <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        </Animated.View>
        <Text style={styles.unitText}>kWh</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={5}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={colors.accent.cyan}
          maximumTrackTintColor={colors.card.background}
          thumbTintColor={colors.accent.cyan}
          step={0.1}
        />
        <Text style={styles.sliderLabel}>5</Text>
      </View>

      <Animated.View style={[styles.earningsContainer, earningsStyle]}>
        <Text style={styles.earningsLabel}>Potential Earnings</Text>
        <Text style={styles.earningsValue}>R{potentialEarnings.toFixed(2)}</Text>
        <Text style={styles.earningsDetail}>
          {value.toFixed(1)} kWh × R{incentiveRate.toFixed(2)}/kWh
        </Text>
      </Animated.View>
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
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  valueText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent.cyan,
  },
  unitText: {
    fontSize: fontSize.xl,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: spacing.sm,
  },
  sliderLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    width: 20,
    textAlign: 'center',
  },
  earningsContainer: {
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.accent.turquoise,
  },
  earningsDetail: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});