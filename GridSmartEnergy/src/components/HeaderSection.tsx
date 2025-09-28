import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

export default function HeaderSection() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <Ionicons name="location-sharp" size={20} color={colors.accent.cyan} />
        <Text style={styles.locationText}>Cape Town, ZA</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.dateText}>{currentDate}</Text>
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  timeText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});