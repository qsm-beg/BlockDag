import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../styles/theme';
import { Prediction } from '../services/predictionService';

interface PredictionCardProps {
  prediction: Prediction;
  onParticipate?: () => void;
}

export default function PredictionCard({ prediction, onParticipate }: PredictionCardProps) {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (prediction.status === 'active' || prediction.probability > 80) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [prediction.status, prediction.probability]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getProbabilityColor = () => {
    if (prediction.probability >= 80) return colors.alert.error;
    if (prediction.probability >= 60) return colors.accent.yellow;
    return colors.accent.green;
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={
          prediction.status === 'active'
            ? [colors.alert.errorLight, colors.alert.error]
            : [colors.card.background, colors.card.backgroundDark]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={colors.accent.cyan} />
            <Text style={styles.location}>{prediction.area}</Text>
            <Text style={styles.city}>{prediction.city}</Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeRange}>
            <Ionicons name="alarm" size={18} color={colors.text.secondary} />
            <Text style={styles.timeText}>
              {formatTime(prediction.timeRange.start)} - {formatTime(prediction.timeRange.end)}
            </Text>
          </View>
        </View>

        <View style={styles.probabilityContainer}>
          <View style={styles.probabilityBar}>
            <View
              style={[
                styles.probabilityFill,
                {
                  width: `${prediction.probability}%`,
                  backgroundColor: getProbabilityColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.probabilityText}>
            {prediction.probability}% probability of overload
          </Text>
        </View>

        {prediction.participationRate !== undefined && (
          <View style={styles.participationContainer}>
            <Ionicons name="people" size={16} color={colors.text.secondary} />
            <Text style={styles.participationText}>
              {prediction.participationRate}% community participation
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  gradient: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  city: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  timeContainer: {
    marginBottom: spacing.md,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  probabilityContainer: {
    marginBottom: spacing.md,
  },
  probabilityBar: {
    height: 6,
    backgroundColor: colors.primary.backgroundDark,
    borderRadius: 3,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  probabilityText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  participationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.card.border,
  },
  participationText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});