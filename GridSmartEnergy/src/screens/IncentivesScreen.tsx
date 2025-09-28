import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../styles/theme';

import CurrentEventCard from '../components/CurrentEventCard';
import UsageCard from '../components/UsageCard';
import EarningsHistory from '../components/EarningsHistory';
import dataSimulator, { EnergyData } from '../services/dataSimulator';
import blockdagService from '../services/blockdagService';

interface EarningItem {
  id: string;
  timestamp: Date;
  amount: number;
  kwhReduced: number;
  type: 'reduction';
}

export default function IncentivesScreen() {
  const [energyData, setEnergyData] = useState<EnergyData>({
    transformerLoad: 45,
    currentUsage: 3.2,
    solarGeneration: 1.5,
    netUsage: 1.7,
    incentiveRate: 2.5,
    isPeakTime: false,
  });

  const [earnings, setEarnings] = useState<EarningItem[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [averageDailyUsage] = useState(25.8); // Mock average daily usage
  const [userStats, setUserStats] = useState<any>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    const unsubscribe = dataSimulator.subscribe((data) => {
      setEnergyData(data);
    });

    generateMockEarnings();
    fetchUserStats();

    // Refresh user stats every 10 seconds
    const interval = setInterval(fetchUserStats, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchUserStats = async () => {
    try {
      const stats = await blockdagService.getUserIncentiveStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleCommitReduction = async (kwhAmount: number) => {
    if (isCommitting) return;

    setIsCommitting(true);
    try {
      const result = await blockdagService.commitReduction(kwhAmount);

      Alert.alert(
        'Commitment Successful!',
        `You committed to reduce ${kwhAmount} kWh.\n\nTransaction: ${result.hash.substring(0, 10)}...\n\nEstimated Reward: ${result.estimatedReward} BDAG`,
        [
          {
            text: 'View on Explorer',
            onPress: () => console.log('Opening:', result.explorerUrl)
          },
          { text: 'OK' }
        ]
      );

      // Refresh user stats after commitment
      await fetchUserStats();

      // Add to earnings history
      const newEarning: EarningItem = {
        id: result.hash,
        timestamp: new Date(),
        amount: parseFloat(result.estimatedReward),
        kwhReduced: kwhAmount,
        type: 'reduction',
      };

      setEarnings(prev => [newEarning, ...prev]);
      setTodayTotal(prev => prev + parseFloat(result.estimatedReward));

    } catch (error) {
      Alert.alert('Error', 'Failed to commit reduction. Please try again.');
      console.error('Commitment error:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  const generateMockEarnings = () => {
    const mockEarnings: EarningItem[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000),
        amount: 65.50,
        kwhReduced: 18.7,
        type: 'reduction',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000),
        amount: 48.00,
        kwhReduced: 13.7,
        type: 'reduction',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 14400000),
        amount: 52.50,
        kwhReduced: 15.0,
        type: 'reduction',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        amount: 58.75,
        kwhReduced: 16.8,
        type: 'reduction',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
        amount: 71.25,
        kwhReduced: 20.4,
        type: 'reduction',
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
        amount: 45.00,
        kwhReduced: 12.9,
        type: 'reduction',
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 86400000 * 4), // 4 days ago
        amount: 62.50,
        kwhReduced: 17.8,
        type: 'reduction',
      },
    ];

    setEarnings(mockEarnings);

    const today = mockEarnings
      .filter(e => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return e.timestamp >= todayStart;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    setTodayTotal(today);
    setWeeklyTotal(mockEarnings.reduce((sum, e) => sum + e.amount, 0));
  };

  const getEventEndTime = () => {
    const now = new Date();
    const endTime = new Date(now);

    if (energyData.isPeakTime) {
      const hour = now.getHours();
      if (hour >= 6 && hour <= 9) {
        endTime.setHours(9, 0, 0, 0);
      } else if (hour >= 17 && hour <= 21) {
        endTime.setHours(21, 0, 0, 0);
      }
    } else {
      const nextHour = now.getHours() + 1;
      if (nextHour === 6 || nextHour === 17) {
        endTime.setHours(nextHour + 3, 0, 0, 0);
      } else {
        endTime.setHours(17, 0, 0, 0);
      }
    }

    return endTime;
  };

  return (
    <LinearGradient
      colors={[colors.primary.background, colors.primary.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.title}>Earn Rewards</Text>
          <Text style={styles.subtitle}>Reduce consumption, earn instantly</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CurrentEventCard
            isActive={energyData.isPeakTime && energyData.transformerLoad > 60}
            incentiveRate={energyData.incentiveRate}
            endTime={getEventEndTime()}
          />

          <UsageCard
            averageDailyUsage={averageDailyUsage}
            currentUsage={energyData.currentUsage * 8} // Mock daily projection
            onCommit={handleCommitReduction}
            isCommitting={isCommitting}
          />

          <EarningsHistory
            earnings={earnings}
            todayTotal={todayTotal}
            weeklyTotal={weeklyTotal}
          />
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
});