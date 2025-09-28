import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, fontSize } from '../styles/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

interface TradeAnimationProps {
  isVisible: boolean;
  type: 'buy' | 'sell';
  amount: number;
  onComplete: () => void;
}

export default function TradeAnimation({ isVisible, type, amount, onComplete }: TradeAnimationProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const particleScale = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1);

      progress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, {
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      particleScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        2,
        false
      );

      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onComplete)();
        });
      }, 2500);
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const pathProps = useAnimatedProps(() => {
    const strokeDashoffset = 200 * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const particleProps = useAnimatedProps(() => ({
    r: particleScale.value * 8,
    opacity: particleScale.value,
  }));

  if (!isVisible) return null;

  const svgWidth = width - 80;
  const svgHeight = 200;
  const pathData = type === 'sell'
    ? `M 40 100 Q ${svgWidth / 2} 50 ${svgWidth - 40} 100`
    : `M ${svgWidth - 40} 100 Q ${svgWidth / 2} 50 40 100`;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
          <AnimatedPath
            d={pathData}
            stroke={type === 'sell' ? colors.status.success : colors.status.warning}
            strokeWidth="3"
            fill="none"
            strokeDasharray="200"
            animatedProps={pathProps}
            strokeLinecap="round"
          />

          <G>
            <AnimatedCircle
              cx={type === 'sell' ? 40 : svgWidth - 40}
              cy={100}
              fill={colors.accent.cyan}
              animatedProps={particleProps}
            />
            <AnimatedCircle
              cx={svgWidth / 2}
              cy={75}
              fill={colors.accent.turquoise}
              animatedProps={particleProps}
            />
            <AnimatedCircle
              cx={type === 'sell' ? svgWidth - 40 : 40}
              cy={100}
              fill={colors.status.success}
              animatedProps={particleProps}
            />
          </G>

          <Circle
            cx={40}
            cy={100}
            r={25}
            fill={type === 'sell' ? colors.status.success : colors.card.background}
            stroke={colors.accent.cyan}
            strokeWidth="2"
          />
          <Circle
            cx={svgWidth - 40}
            cy={100}
            r={25}
            fill={type === 'sell' ? colors.card.background : colors.status.warning}
            stroke={colors.accent.cyan}
            strokeWidth="2"
          />
        </Svg>

        <Text style={styles.label}>
          {type === 'sell' ? 'Selling' : 'Buying'} {amount.toFixed(2)} kWh
        </Text>
        <Text style={styles.status}>Energy Transfer in Progress...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  svg: {
    marginBottom: 40,
  },
  label: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  status: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
});