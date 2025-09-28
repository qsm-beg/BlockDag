import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

export interface Trade {
  id: string;
  userId: string;
  type: 'selling' | 'buying';
  amount: number;
  pricePerKwh: number;
  distance: number;
  timestamp: Date;
}

interface NearbyTradesListProps {
  trades: Trade[];
  onTrade: (trade: Trade) => void;
}

function TradeItem({ trade, onTrade, index }: { trade: Trade; onTrade: (trade: Trade) => void; index: number }) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 400,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDistanceColor = (distance: number) => {
    if (distance < 1) return colors.status.success;
    if (distance < 3) return colors.accent.cyan;
    return colors.text.secondary;
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100)}
      layout={Layout.springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={styles.tradeItem}
        onPress={() => onTrade(trade)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.tradeItemLeft}>
          <View style={[
            styles.typeIndicator,
            { backgroundColor: trade.type === 'selling' ? colors.status.success : colors.status.warning }
          ]}>
            <Ionicons
              name={trade.type === 'selling' ? 'push-outline' : 'download-outline'}
              size={16}
              color={colors.text.primary}
            />
          </View>
          <View style={styles.tradeInfo}>
            <Text style={styles.userId}>{shortenAddress(trade.userId)}</Text>
            <Text style={styles.tradeType}>
              {trade.type === 'selling' ? 'Selling' : 'Needs'} {trade.amount.toFixed(1)} kWh
            </Text>
            <View style={styles.distanceRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={getDistanceColor(trade.distance)}
              />
              <Text style={[styles.distance, { color: getDistanceColor(trade.distance) }]}>
                {trade.distance.toFixed(1)} km away
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.tradeItemRight}>
          <Text style={styles.price}>R{trade.pricePerKwh.toFixed(2)}/kWh</Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: trade.type === 'selling' ? colors.status.warning : colors.status.success }
            ]}
            onPress={() => onTrade(trade)}
          >
            <Text style={styles.actionButtonText}>
              {trade.type === 'selling' ? 'Buy' : 'Sell'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NearbyTradesList({ trades, onTrade }: NearbyTradesListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Trades</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{trades.length} Available</Text>
        </View>
      </View>

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {trades.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No trades nearby</Text>
            <Text style={styles.emptySubtext}>Check back later for trading opportunities</Text>
          </View>
        ) : (
          trades.map((trade, index) => (
            <TradeItem key={trade.id} trade={trade} onTrade={onTrade} index={index} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card.border,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.accent.cyan,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  listContainer: {
    maxHeight: 300,
  },
  tradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  tradeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  tradeInfo: {
    flex: 1,
  },
  userId: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tradeType: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  distance: {
    fontSize: fontSize.xs,
    marginLeft: 4,
  },
  tradeItemRight: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.accent.cyan,
    marginBottom: spacing.xs,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  actionButtonText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});