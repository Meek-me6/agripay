import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const trendMap = {
  up: { icon: 'trending-up', color: colors.success },
  down: { icon: 'trending-down', color: colors.danger },
  flat: { icon: 'remove', color: colors.textMuted },
};

export default function PriceRow({ item }) {
  const trend = trendMap[item.trend] || trendMap.flat;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.crop}>{item.crop}</Text>
        <Text style={styles.market}>{item.market}</Text>
      </View>
      <View style={styles.priceWrap}>
        <Text style={styles.price}>GHS {item.price}</Text>
        <Text style={styles.unit}>{item.unit}</Text>
      </View>
      <Ionicons name={trend.icon} size={18} color={trend.color} style={{ marginLeft: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  crop: { fontSize: 15, fontWeight: '600', color: colors.text },
  market: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  priceWrap: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary },
  unit: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
});
