import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../styles/theme';
import { Prediction } from '../services/predictionService';

interface PredictionAlertProps {
  prediction: Prediction | null;
}

export default function PredictionAlert({ prediction }: PredictionAlertProps) {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (prediction) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [prediction]);

  useEffect(() => {
    if (!prediction) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(prediction.timeRange.start);
      const diff = start.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m`);
        } else {
          setCountdown(`${minutes}m`);
        }
      } else if (prediction.status === 'active') {
        setCountdown('Active Now');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [prediction]);

  if (!prediction) return null;

  const isActive = prediction.status === 'active';
  const isHighRisk = prediction.probability >= 80;

  const handleViewDetails = () => {
    navigation.navigate('Insights' as never);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={
          isActive
            ? [colors.alert.error, colors.alert.errorLight]
            : isHighRisk
            ? [colors.accent.yellow, colors.accent.yellowDark]
            : [colors.accent.cyan, colors.accent.cyanDark]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isActive ? 'flash' : 'bulb'}
              size={24}
              color={colors.white}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isActive ? 'Overload Risk Active' : 'AI Prediction Alert'}
            </Text>
            <Text style={styles.subtitle}>
              {prediction.area}, {prediction.city}
            </Text>
          </View>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.timeInfo}>
            <Ionicons name="time" size={16} color={colors.white} />
            <Text style={styles.timeText}>
              {formatTime(prediction.timeRange.start)} - {formatTime(prediction.timeRange.end)}
            </Text>
          </View>

          <View style={styles.probabilityInfo}>
            <Text style={styles.probabilityLabel}>Risk Level:</Text>
            <View style={styles.probabilityBar}>
              <View
                style={[
                  styles.probabilityFill,
                  { width: `${prediction.probability}%` },
                ]}
              />
            </View>
            <Text style={styles.probabilityValue}>{prediction.probability}%</Text>
          </View>

          {isActive && prediction.participationRate !== undefined && (
            <View style={styles.participationInfo}>
              <Ionicons name="people" size={16} color={colors.white} />
              <Text style={styles.participationText}>
                {prediction.participationRate.toFixed(0)}% neighbors participating
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleViewDetails}>
          <Text style={styles.actionButtonText}>
            {isActive ? 'Join & Earn Rewards' : 'View Details'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  gradient: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  countdownBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  content: {
    marginBottom: spacing.md,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeText: {
    fontSize: 13,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  probabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  probabilityLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: spacing.sm,
  },
  probabilityBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  probabilityValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  participationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  participationText: {
    fontSize: 12,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginRight: spacing.xs,
  },
});