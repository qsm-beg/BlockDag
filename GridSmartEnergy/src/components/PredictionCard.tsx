import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../styles/theme';
import { Prediction } from '../services/predictionService';

interface PredictionCardProps {
  prediction: Prediction;
  onParticipate?: () => void;
}

export default function PredictionCard({ prediction, onParticipate }: PredictionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(prediction.timeRange.start);
      const diff = start.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes} minutes`);
        }
      } else {
        setTimeRemaining('Active Now');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [prediction]);

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

  const getStatusIcon = () => {
    switch (prediction.status) {
      case 'active':
        return 'flash';
      case 'upcoming':
        return 'time';
      case 'completed':
        return 'checkmark-circle';
      default:
        return 'alert-circle';
    }
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
          <View style={[styles.statusBadge, prediction.status === 'active' && styles.activeBadge]}>
            <Ionicons
              name={getStatusIcon()}
              size={14}
              color={prediction.status === 'active' ? colors.white : colors.text.secondary}
            />
            <Text
              style={[styles.statusText, prediction.status === 'active' && styles.activeStatusText]}
            >
              {timeRemaining}
            </Text>
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

        {prediction.status === 'upcoming' && (
          <TouchableOpacity style={styles.participateButton} onPress={onParticipate}>
            <LinearGradient
              colors={[colors.accent.cyan, colors.accent.cyanDark]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.participateButtonText}>Commit to Reduce</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}

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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.backgroundDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: colors.white,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  activeStatusText: {
    color: colors.alert.error,
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
  participateButton: {
    marginTop: spacing.sm,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  participateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: spacing.xs,
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