import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../styles/theme';

import HeaderSection from '../components/HeaderSection';
import TransformerLoadGauge from '../components/TransformerLoadGauge';
import AlertBanner from '../components/AlertBanner';
import UserEnergyStatus from '../components/UserEnergyStatus';
import dataSimulator, { EnergyData } from '../services/dataSimulator';

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

  useEffect(() => {
    const unsubscribe = dataSimulator.subscribe((data) => {
      setEnergyData(data);
    });

    return unsubscribe;
  }, []);

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
});