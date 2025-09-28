import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar, Alert, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize } from '../styles/theme';

import EnergyBalanceCard from '../components/EnergyBalanceCard';
import QuickTradeSection from '../components/QuickTradeSection';
import NearbyTradesList, { Trade } from '../components/NearbyTradesList';
import TradeAnimation from '../components/TradeAnimation';
import dataSimulator, { EnergyData } from '../services/dataSimulator';

export default function TradingScreen() {
  const [energyData, setEnergyData] = useState<EnergyData>({
    transformerLoad: 45,
    currentUsage: 3.2,
    solarGeneration: 1.5,
    netUsage: 1.7,
    incentiveRate: 2.5,
    isPeakTime: false,
  });

  const [pricePerKwh, setPricePerKwh] = useState(12.50);
  const [priceChange, setPriceChange] = useState(0);
  const [nearbyTrades, setNearbyTrades] = useState<Trade[]>([]);
  const [showTradeAnimation, setShowTradeAnimation] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('sell');
  const [tradeAmount, setTradeAmount] = useState(0);
  const [dailyAverage] = useState(23);

  useEffect(() => {
    const unsubscribe = dataSimulator.subscribe((data) => {
      setEnergyData(data);
    });

    generateMockTrades();
    simulatePriceChanges();

    return unsubscribe;
  }, []);

  const generateMockTrades = () => {
    const mockTrades: Trade[] = [
      {
        id: '1',
        userId: '0x1234567890abcdef1234',
        type: 'selling',
        amount: 2.5,
        pricePerKwh: 11.80,
        distance: 0.8,
        timestamp: new Date(),
      },
      {
        id: '2',
        userId: '0xabcdef1234567890abcd',
        type: 'buying',
        amount: 1.8,
        pricePerKwh: 13.20,
        distance: 1.5,
        timestamp: new Date(),
      },
      {
        id: '3',
        userId: '0x9876543210fedcba9876',
        type: 'selling',
        amount: 3.2,
        pricePerKwh: 12.00,
        distance: 2.3,
        timestamp: new Date(),
      },
      {
        id: '4',
        userId: '0xfedcba9876543210fedc',
        type: 'buying',
        amount: 4.0,
        pricePerKwh: 13.50,
        distance: 3.1,
        timestamp: new Date(),
      },
    ];

    setNearbyTrades(mockTrades);
  };

  const simulatePriceChanges = () => {
    setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setPriceChange(change);
      setPricePerKwh((prev) => {
        const newPrice = prev + change * 0.1;
        return Math.max(10, Math.min(15, newPrice));
      });
    }, 5000);
  };

  const hasExcess = energyData.solarGeneration > energyData.netUsage;
  const availableAmount = hasExcess
    ? energyData.solarGeneration - energyData.netUsage
    : energyData.netUsage - energyData.solarGeneration;

  const handleQuickTrade = () => {
    setTradeType(hasExcess ? 'sell' : 'buy');
    setTradeAmount(availableAmount);
    setShowTradeAnimation(true);
  };

  const handleNearbyTrade = (trade: Trade) => {
    const userAction = trade.type === 'selling' ? 'buy' : 'sell';

    Alert.alert(
      `${userAction === 'buy' ? 'Buy' : 'Sell'} Energy`,
      `${userAction === 'buy' ? 'Buy' : 'Sell'} ${trade.amount.toFixed(1)} kWh at R${trade.pricePerKwh.toFixed(2)}/kWh?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setTradeType(userAction);
            setTradeAmount(trade.amount);
            setShowTradeAnimation(true);
          },
        },
      ]
    );
  };

  const handleTradeComplete = () => {
    setShowTradeAnimation(false);

    Alert.alert(
      'Trade Successful!',
      `You've ${tradeType === 'sell' ? 'sold' : 'bought'} ${tradeAmount.toFixed(1)} kWh for R${(
        tradeAmount * pricePerKwh
      ).toFixed(2)}`,
      [{ text: 'OK', style: 'default' }]
    );

    setNearbyTrades((prev) => prev.filter((_, index) => index !== 0));
  };

  return (
    <LinearGradient
      colors={[colors.primary.background, colors.primary.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.title}>Energy Trading</Text>
          <Text style={styles.subtitle}>P2P Energy Marketplace</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <EnergyBalanceCard
            netUsage={energyData.netUsage}
            solarGeneration={energyData.solarGeneration}
            dailyAverage={dailyAverage}
          />

          <QuickTradeSection
            hasExcess={hasExcess}
            amount={availableAmount}
            pricePerKwh={pricePerKwh}
            priceChange={priceChange}
            onTrade={handleQuickTrade}
          />

          <NearbyTradesList
            trades={nearbyTrades}
            onTrade={handleNearbyTrade}
          />
        </ScrollView>
      </SafeAreaView>

      <TradeAnimation
        isVisible={showTradeAnimation}
        type={tradeType}
        amount={tradeAmount}
        onComplete={handleTradeComplete}
      />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: spacing.xs,
  },
});