import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import Header from '../components/Header';
import PriceRow from '../components/PriceRow';
import { mockPrices } from '../data/mockData';
import { colors, spacing } from '../theme/colors';

export default function PriceBoardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [prices, setPrices] = useState(mockPrices);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Real flow: fetch latest prices from your backend, which the
    // web companion admin panel updates daily, then Moolre's SMS
    // API pushes a bulletin to feature-phone farmers automatically.
    setTimeout(() => {
      setPrices(mockPrices);
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Price Board" subtitle="Updated this morning · pull to refresh" />
      <FlatList
        data={prices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => <PriceRow item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={
          <Text style={styles.footerNote}>
            Feature-phone farmers receive this same bulletin daily via SMS — no app needed.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footerNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    lineHeight: 17,
  },
});
