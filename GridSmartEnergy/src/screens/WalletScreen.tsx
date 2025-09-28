import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing } from '../styles/theme';

import WalletConnectionSection from '../components/WalletConnectionSection';
import PendingRewardsCard from '../components/PendingRewardsCard';
import ActivityFeed, { Activity } from '../components/ActivityFeed';
import StatsSummary from '../components/StatsSummary';

export default function WalletScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(45.75);
  const [lastClaimDate, setLastClaimDate] = useState<Date | undefined>(
    new Date(Date.now() - 86400000 * 3)
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 326,
    energySaved: 142,
    tradesCompleted: 18,
    currentStreak: 7,
  });

  useEffect(() => {
    generateMockActivities();
  }, []);

  const generateMockActivities = () => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'reduction',
        description: 'Energy reduction during peak hours',
        amount: 12.50,
        timestamp: new Date(Date.now() - 3600000),
        status: 'completed',
      },
      {
        id: '2',
        type: 'trade',
        description: 'Sold 2.5 kWh to neighbor',
        amount: 31.25,
        timestamp: new Date(Date.now() - 7200000),
        status: 'completed',
      },
      {
        id: '3',
        type: 'claim',
        description: 'Claimed weekly rewards',
        amount: 85.00,
        timestamp: new Date(Date.now() - 86400000),
        status: 'completed',
      },
      {
        id: '4',
        type: 'solar',
        description: 'Solar generation bonus',
        amount: 8.50,
        timestamp: new Date(Date.now() - 86400000 * 2),
        status: 'completed',
      },
      {
        id: '5',
        type: 'reduction',
        description: 'Morning peak reduction',
        amount: 9.25,
        timestamp: new Date(Date.now() - 86400000 * 2),
        status: 'pending',
      },
    ];

    setActivities(mockActivities);
  };

  const handleConnect = () => {
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8');
      setBalance(125.4567);
      Alert.alert(
        'Wallet Connected!',
        'Your BlockDAG wallet has been successfully connected.',
        [{ text: 'OK', style: 'default' }]
      );
    }, 1500);
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Copied!', 'Wallet address copied to clipboard', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleClaim = () => {
    if (pendingRewards > 0) {
      Alert.alert(
        'Claim Rewards',
        `Claim R${pendingRewards.toFixed(2)} to your wallet?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Claim',
            onPress: () => {
              const claimedAmount = pendingRewards;
              setPendingRewards(0);
              setLastClaimDate(new Date());
              setBalance((prev) => prev + claimedAmount / 10);

              const newActivity: Activity = {
                id: Date.now().toString(),
                type: 'claim',
                description: 'Claimed pending rewards',
                amount: claimedAmount,
                timestamp: new Date(),
                status: 'completed',
              };

              setActivities([newActivity, ...activities]);
              setStats((prev) => ({
                ...prev,
                totalEarned: prev.totalEarned + claimedAmount,
              }));

              Alert.alert(
                'Success!',
                `R${claimedAmount.toFixed(2)} has been added to your wallet.`,
                [{ text: 'OK', style: 'default' }]
              );
            },
          },
        ]
      );
    }
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
          <WalletConnectionSection
            isConnected={isConnected}
            address={walletAddress}
            balance={balance}
            onConnect={handleConnect}
            onCopyAddress={handleCopyAddress}
          />

          {isConnected && (
            <>
              <PendingRewardsCard
                pendingAmount={pendingRewards}
                lastClaimDate={lastClaimDate}
                onClaim={handleClaim}
                isClaimable={pendingRewards > 0}
              />

              <ActivityFeed activities={activities} />

              <StatsSummary
                totalEarned={stats.totalEarned}
                energySaved={stats.energySaved}
                tradesCompleted={stats.tradesCompleted}
                currentStreak={stats.currentStreak}
              />
            </>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
});