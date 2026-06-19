import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { mockListings } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';
// import { collectPayment } from '../api/paymentsApi';
// import { disburseToFarmer } from '../api/transfersApi';

export default function MarketplaceScreen() {
  const [listings] = useState(mockListings);

  const handleBuy = (item) => {
    Alert.alert(
      `Buy ${item.crop}`,
      `${item.quantity} from ${item.seller} (${item.location}) at GHS ${item.price}.\n\nThis would trigger Moolre's Payments API to collect from the buyer into escrow, then Transfers API to release to the seller once delivery is confirmed.`,
      [{ text: 'OK' }]
    );
    // Real flow:
    // 1. collectPayment({ phone: buyerPhone, amount: item.price, reference }) -> escrow hold
    // 2. on delivery confirmation, disburseToFarmer({ ...sellerDetails }) -> release funds
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Marketplace" subtitle="Buy and sell with escrow protection" />
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.crop}>{item.crop}</Text>
              <Text style={styles.meta}>{item.quantity} · {item.seller} · {item.location}</Text>
              <Text style={styles.price}>GHS {item.price}</Text>
            </View>
            <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
              <Text style={styles.buyText}>Buy</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  crop: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 6 },
  buyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  buyText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
