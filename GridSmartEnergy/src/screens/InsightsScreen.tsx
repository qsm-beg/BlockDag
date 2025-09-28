import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';
import PredictionCard from '../components/PredictionCard';
import PredictionHistory from '../components/PredictionHistory';
import AccuracyMetrics from '../components/AccuracyMetrics';
import { predictionService, Prediction, PredictionRecord } from '../services/predictionService';

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [accuracy, setAccuracy] = useState({
    weekly: 0,
    monthly: 0,
    overloadsPrevented: 0,
  });

  useEffect(() => {
    const unsubscribePredictions = predictionService.subscribeToUpcoming((data) => {
      setPredictions(data);
    });

    const unsubscribeHistory = predictionService.subscribeToHistory((data) => {
      setHistory(data);
    });

    const unsubscribeAccuracy = predictionService.subscribeToAccuracy((data) => {
      setAccuracy(data);
    });

    return () => {
      unsubscribePredictions();
      unsubscribeHistory();
      unsubscribeAccuracy();
    };
  }, []);

  return (
    <LinearGradient
      colors={[colors.primary.background, colors.primary.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="bulb" size={28} color={colors.accent.yellow} />
            <Text style={styles.title}>AI Insights</Text>
          </View>
          <Text style={styles.subtitle}>Predictive Grid Intelligence</Text>
        </View>

        <AccuracyMetrics accuracy={accuracy} />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming Predictions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History & Records
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'upcoming' ? (
            <View style={styles.predictionsContainer}>
              {predictions.length > 0 ? (
                predictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color={colors.accent.green} />
                  <Text style={styles.emptyStateTitle}>Grid Stable</Text>
                  <Text style={styles.emptyStateText}>
                    No overload predictions in the next 48 hours
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <PredictionHistory history={history} />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 36,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card.background,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary.background,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.accent.cyan,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  predictionsContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});