import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../styles/theme';

import HeaderSection from '../components/HeaderSection';
import TransformerLoadGauge from '../components/TransformerLoadGauge';
import AlertBanner from '../components/AlertBanner';
import UserEnergyStatus from '../components/UserEnergyStatus';
import dataSimulator, { EnergyData } from '../services/dataSimulator';
import blockdagService from '../services/blockdagService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [energyData, setEnergyData] = useState<EnergyData>({
    transformerLoad: 45,
    currentUsage: 3.2,
    solarGeneration: 1.5,
    netUsage: 1.7,
    incentiveRate: 2.5,
    isPeakTime: false,
  });
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  useEffect(() => {
    // Initialize BlockDAG connection
    initializeBlockchain();

    // Subscribe to data simulator for UI updates
    const unsubscribe = dataSimulator.subscribe((data) => {
      setEnergyData(data);
    });

    // Fetch transformer load from blockchain every 5 seconds
    const interval = setInterval(async () => {
      await fetchTransformerLoad();
      await fetchNetworkInfo();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const initializeBlockchain = async () => {
    try {
      const result = await blockdagService.connect();
      console.log('BlockDAG connected:', result);
      await fetchTransformerLoad();
      await fetchNetworkInfo();
    } catch (error) {
      console.error('BlockDAG connection failed:', error);
    }
  };

  const fetchTransformerLoad = async () => {
    try {
      const loadData = await blockdagService.getTransformerLoad();
      setBlockchainData(loadData);
      // Update energy data with blockchain values
      setEnergyData(prev => ({
        ...prev,
        transformerLoad: parseFloat(loadData.currentLoad),
        isPeakTime: blockdagService.isPeakHours(),
      }));
    } catch (error) {
      console.error('Failed to fetch transformer load:', error);
    }
  };

  const fetchNetworkInfo = async () => {
    try {
      const info = await blockdagService.getNetworkInfo();
      setNetworkInfo(info);
    } catch (error) {
      console.error('Failed to fetch network info:', error);
    }
  };

  const handleReduceNow = () => {
    navigation.navigate('Incentives' as never);
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
          <HeaderSection />

          {networkInfo && (
            <View style={styles.blockchainStatus}>
              <Text style={styles.blockchainText}>
                BlockDAG Network: Block #{networkInfo.blockNumber}
              </Text>
              <View style={styles.statusDot} />
            </View>
          )}

          <TransformerLoadGauge load={energyData.transformerLoad} />

          <AlertBanner
            isVisible={energyData.transformerLoad > 70}
            incentiveRate={energyData.incentiveRate}
            onReduceNow={handleReduceNow}
          />

          <UserEnergyStatus
            currentUsage={energyData.currentUsage}
            solarGeneration={energyData.solarGeneration}
            netUsage={energyData.netUsage}
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
  },
  blockchainStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
  },
  blockchainText: {
    color: colors.accent.cyan,
    fontSize: 12,
    marginRight: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});