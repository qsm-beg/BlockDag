import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../styles/theme';

import CurrentEventCard from '../components/CurrentEventCard';
import ReductionSlider from '../components/ReductionSlider';
import EarningsHistory from '../components/EarningsHistory';
import CommitButton from '../components/CommitButton';
import dataSimulator, { EnergyData } from '../services/dataSimulator';

interface EarningItem {
  id: string;
  timestamp: Date;
  amount: number;
  kwhReduced: number;
  type: 'reduction' | 'trade';
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

  const [reductionAmount, setReductionAmount] = useState(0);
  const [isCommitting, setIsCommitting] = useState(false);
  const [earnings, setEarnings] = useState<EarningItem[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  useEffect(() => {
    const unsubscribe = dataSimulator.subscribe((data) => {
      setEnergyData(data);
    });

    generateMockEarnings();

    return unsubscribe;
  }, []);

  const generateMockEarnings = () => {
    const mockEarnings: EarningItem[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000),
        amount: 12.50,
        kwhReduced: 3.5,
        type: 'reduction',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000),
        amount: 8.00,
        kwhReduced: 2.3,
        type: 'reduction',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 14400000),
        amount: 5.50,
        kwhReduced: 1.5,
        type: 'trade',
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

  const handleCommit = async () => {
    if (reductionAmount === 0) return;

    setIsCommitting(true);

    setTimeout(() => {
      const newEarning: EarningItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        amount: reductionAmount * energyData.incentiveRate,
        kwhReduced: reductionAmount,
        type: 'reduction',
      };

      setEarnings([newEarning, ...earnings]);
      setTodayTotal(todayTotal + newEarning.amount);
      setWeeklyTotal(weeklyTotal + newEarning.amount);

      Alert.alert(
        'Commitment Successful!',
        `You've committed to reduce ${reductionAmount.toFixed(1)} kWh and will earn R${(
          reductionAmount * energyData.incentiveRate
        ).toFixed(2)}`,
        [{ text: 'OK', style: 'default' }]
      );

      setReductionAmount(0);
      setIsCommitting(false);
    }, 1500);
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

          <ReductionSlider
            incentiveRate={energyData.incentiveRate}
            value={reductionAmount}
            onValueChange={setReductionAmount}
          />

          <CommitButton
            onPress={handleCommit}
            disabled={reductionAmount === 0 || !energyData.isPeakTime}
            isLoading={isCommitting}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
});