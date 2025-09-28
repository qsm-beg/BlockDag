import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

interface UsageCardProps {
  averageDailyUsage: number;
  currentUsage: number;
  onCommit?: (kwhAmount: number) => void;
  isCommitting?: boolean;
}

export default function UsageCard({ averageDailyUsage, currentUsage, onCommit, isCommitting = false }: UsageCardProps) {
  const [showCommitForm, setShowCommitForm] = useState(false);
  const [commitAmount, setCommitAmount] = useState('2');
  return (
    <LinearGradient
      colors={[colors.card.background, colors.card.backgroundDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flash" size={24} color={colors.accent.cyan} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Your Daily Consumption</Text>

        <View style={styles.usageContainer}>
          <Text style={styles.label}>Average Daily:</Text>
          <Text style={styles.value}>{averageDailyUsage.toFixed(1)} kWh</Text>
        </View>

        <View style={styles.usageContainer}>
          <Text style={styles.label}>Current Usage:</Text>
          <Text style={[styles.value, { color: colors.accent.cyan }]}>
            {currentUsage.toFixed(1)} kWh
          </Text>
        </View>

        <View style={styles.divider} />

        {!showCommitForm ? (
          <>
            <Text style={styles.message}>
              Reduce usage today to earn incentives
            </Text>
            {onCommit && (
              <TouchableOpacity
                style={styles.commitButton}
                onPress={() => setShowCommitForm(true)}
                disabled={isCommitting}
              >
                <Text style={styles.commitButtonText}>Commit to Reduce</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.commitForm}>
            <Text style={styles.commitFormLabel}>Commit to reduce (kWh):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={commitAmount}
                onChangeText={setCommitAmount}
                keyboardType="numeric"
                placeholder="2.0"
                placeholderTextColor={colors.text.secondary}
              />
              <TouchableOpacity
                style={[styles.submitButton, isCommitting && styles.submitButtonDisabled]}
                onPress={() => {
                  const amount = parseFloat(commitAmount);
                  if (amount > 0 && amount <= 50) {
                    onCommit?.(amount);
                    setShowCommitForm(false);
                  }
                }}
                disabled={isCommitting}
              >
                <Text style={styles.submitButtonText}>
                  {isCommitting ? 'Processing...' : 'Submit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCommitForm(false)}
                disabled={isCommitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: colors.card.border,
    marginVertical: spacing.md,
  },
  message: {
    fontSize: 14,
    color: colors.accent.cyan,
    textAlign: 'center',
    fontWeight: '600',
  },
  commitButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.cyan,
    borderRadius: 8,
  },
  commitButtonText: {
    color: colors.primary.dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  commitForm: {
    width: '100%',
  },
  commitFormLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    maxWidth: 100,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.card.border,
    textAlign: 'center',
  },
  submitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.primary.dark,
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
});